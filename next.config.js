/** @type {import('next').NextConfig} */

module.exports = {
  async headers() {
    return [
      {
        // Allow requests from any origin during development
        source: "/",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },
};
