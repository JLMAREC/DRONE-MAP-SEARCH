module.exports = {
    async rewrites() {
      return [
        {
          source: '/share/:teamId',
          destination: '/share/[teamId]'
        }
      ];
    }
  }
