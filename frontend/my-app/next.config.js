module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/client-requests/:path*",
        destination: "http://127.0.0.1:8000/api/client-requests/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/auth/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};
