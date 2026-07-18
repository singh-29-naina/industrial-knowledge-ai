// mongodb-dns-fix.js
// This file forces Node.js to use Google DNS for MongoDB connections

import dns from 'dns';
import { Resolver } from 'dns';

// Force Node.js to use Google DNS for ALL DNS queries
export function forceGoogleDNS() {
  // Set default DNS servers globally
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
  
  console.log('✅ Forced DNS to Google DNS (8.8.8.8, 8.8.4.4)');
  console.log('Current DNS servers:', dns.getServers());
}

// Alternative: Patch the dns.promises module to always use Google DNS
export function patchDNSPromises() {
  const originalResolveSrv = dns.promises.resolveSrv;
  
  dns.promises.resolveSrv = async function(hostname) {
    const resolver = new Resolver();
    resolver.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
    
    return new Promise((resolve, reject) => {
      resolver.resolveSrv(hostname, (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses);
      });
    });
  };
  
  console.log('✅ Patched dns.promises to use Google DNS');
}

// Use this before connecting to MongoDB
export function setupDNSForMongoDB() {
  forceGoogleDNS();
  patchDNSPromises();
}