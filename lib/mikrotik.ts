import { RouterOSAPI } from 'node-routeros';

interface MikrotikAuth {
  host: string;
  user: string;
  password?: string;
  port?: number;
}

export async function testMikrotikConnection(auth: MikrotikAuth): Promise<boolean> {
  const api = new RouterOSAPI({
    host: auth.host,
    user: auth.user,
    password: auth.password || "",
    port: auth.port || 8728,
    timeout: 5,
    keepalive: false
  });

  try {
    await api.connect();
    await api.close();
    return true;
  } catch (error) {
    console.error('Mikrotik connection failed:', error);
    return false;
  }
}

export async function getMikrotikStatus(auth: MikrotikAuth, pppUser: string) {
  const api = new RouterOSAPI({
    host: auth.host,
    user: auth.user,
    password: auth.password || "",
    port: auth.port || 8728,
    timeout: 10,
    keepalive: false
  });

  try {
    await api.connect();
    
    // Get Secret info
    const secrets = await api.write('/ppp/secret/print', [`?name=${pppUser}`]);
    if (secrets.length === 0) {
      await api.close();
      return { error: 'not_found' };
    }

    const secret = secrets[0];

    // Get Active connection info
    const actives = await api.write('/ppp/active/print', [`?name=${pppUser}`]);
    const active = actives.length > 0 ? actives[0] : null;

    await api.close();

    return {
      success: true,
      secret: {
        name: secret.name,
        profile: secret.profile,
        disabled: secret.disabled === 'true',
        comment: secret.comment || ''
      },
      active: active ? {
        address: active.address,
        uptime: active.uptime,
        callerId: active['caller-id'] || ''
      } : null
    };
  } catch (error) {
    console.error('Error getting Mikrotik status:', error);
    try { await api.close(); } catch (e) {}
    throw error;
  }
}

export async function getMikrotikTraffic(auth: MikrotikAuth, pppUser: string) {
  const api = new RouterOSAPI({
    host: auth.host,
    user: auth.user,
    password: auth.password || "",
    port: auth.port || 8728,
    timeout: 5,
    keepalive: false
  });

  try {
    await api.connect();
    // Try to find traffic in /interface/monitor-traffic
    const traffic = await api.write('/interface/monitor-traffic', [
      '=interface=' + pppUser,
      '=once='
    ]);
    
    await api.close();

    if (traffic.length > 0) {
      return {
        rx: parseInt(traffic[0]['rx-bits-per-second']) || 0,
        tx: parseInt(traffic[0]['tx-bits-per-second']) || 0
      };
    }
    return { rx: 0, tx: 0 };
  } catch (error) {
    console.error('Error getting Mikrotik traffic:', error);
    try { await api.close(); } catch (e) {}
    return { rx: 0, tx: 0 };
  }
}

export async function activateMikrotikUser(auth: MikrotikAuth, pppUser: string) {
  const api = new RouterOSAPI({
    host: auth.host,
    user: auth.user,
    password: auth.password || "",
    port: auth.port || 8728,
    timeout: 10,
    keepalive: false
  });

  try {
    await api.connect();
    
    // 1. Find the secret ID
    const secrets = await api.write('/ppp/secret/print', [`?name=${pppUser}`]);
    if (secrets.length === 0) {
      await api.close();
      return { success: false, error: 'User not found' };
    }

    const secretId = secrets[0]['.id'];

    // 2. Enable the secret
    await api.write('/ppp/secret/set', [
      `=.id=${secretId}`,
      '=disabled=false'
    ]);

    // 3. (Optional but good) Remove from active connections to force immediate reconnect
    const actives = await api.write('/ppp/active/print', [`?name=${pppUser}`]);
    if (actives.length > 0) {
      for (const active of actives) {
        await api.write('/ppp/active/remove', [`=.id=${active['.id']}`]);
      }
    }

    await api.close();
    return { success: true };
  } catch (error) {
    console.error('Error activating Mikrotik user:', error);
    try { await api.close(); } catch (e) {}
    throw error;
  }
}
