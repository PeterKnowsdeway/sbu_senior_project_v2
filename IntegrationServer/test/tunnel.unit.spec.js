/* const { expect } = require('chai');
const localtunnel = require('localtunnel');

const { createTunnel } = require('../src/tunnelHelper/tunnel.js');

describe('createTunnel', () => {
  let tunnel;
  
  afterEach(async () => {
    if (tunnel) {
      await tunnel.close();
      tunnel = null;
    }
  });
  
  it('should create a tunnel on the specified port', async () => {
    const port = 3000;
    tunnel = await createTunnel(port);
    
    expect(tunnel).to.be.an.instanceof(localtunnel.Tunnel);
    expect(tunnel.url).to.match(/^https:\/\/[\w-]+\.loca\.lt:\d+$/);
  });
  
  it('should create a tunnel on a random URL if one desired cannot be obtained', async () => {
    const port = 3000;
    process.env.TUNNEL_SUBDOMAIN = 'my-subdomain';
    try {
      tunnel = await createTunnel(port, 20);
    } catch (error) {
      expect(error).to.be.an.instanceof(Error);
      expect(error.message).to.equal('could not create a tunnel with the desired subdomain');
    }
  });
}); */