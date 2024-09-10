import Typesense from 'typesense';

const client = new Typesense.Client({
  nodes: [
    {
      host: "b84zp19gdc3xnmvsp-1.a1.typesense.net",
      port: "443",
      protocol: "https",
    }
  ],
  apiKey: 'J0YEtIcIEBoJ8PwLaQFd6cq4wX53MPJY',
  connectionTimeoutSeconds: 2
});

export default client;