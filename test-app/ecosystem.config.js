module.exports = {
  apps: [
    {
      name: "test-app",
      script: "./app.js",
      cwd: "/home/ubuntu/project-root/test-app", // 実行ディレクトリ
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
