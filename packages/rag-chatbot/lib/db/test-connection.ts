import { config } from "dotenv";
import postgres from "postgres";

// 加载环境变量
config({
  path: ".env",
});

const testConnection = async () => {
  console.log("🔍 开始测试 PostgreSQL 连接...\n");

  // 检查环境变量
  if (!process.env.POSTGRES_URL) {
    console.error("❌ 错误: POSTGRES_URL 环境变量未设置");
    console.log("请在 .env 文件中设置 POSTGRES_URL");
    process.exit(1);
  }

  console.log("✅ 找到 POSTGRES_URL 环境变量");
  // 显示部分连接字符串（隐藏敏感信息）
  const urlPreview = process.env.POSTGRES_URL.replace(
    /(:\/\/)([^:]+):([^@]+)(@)/,
    "$1***:***$4"
  );
  console.log(`📌 连接字符串: ${urlPreview}\n`);

  let connection;

  try {
    // 创建连接
    console.log("⏳ 正在连接到 PostgreSQL...");
    connection = postgres(process.env.POSTGRES_URL, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    // 执行简单查询测试连接
    const result =
      await connection`SELECT version(), current_database(), current_user`;

    console.log("✅ 连接成功!\n");
    console.log("📊 数据库信息:");
    console.log(`   • PostgreSQL 版本: ${result[0].version}`);
    console.log(`   • 当前数据库: ${result[0].current_database}`);
    console.log(`   • 当前用户: ${result[0].current_user}`);

    // 测试表是否存在
    console.log("\n🔍 检查数据库表...");
    const tables = await connection`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    if (tables.length > 0) {
      console.log(`✅ 找到 ${tables.length} 个表:`);
      tables.forEach((table) => {
        console.log(`   • ${table.table_name}`);
      });
    } else {
      console.log("⚠️  数据库中还没有表，可能需要运行迁移");
      console.log("   运行: pnpm db:migrate");
    }

    console.log("\n✅ 所有测试通过!");
  } catch (error) {
    console.error("\n❌ 连接失败!");

    if (error instanceof Error) {
      console.error(`错误信息: ${error.message}`);

      // 提供更详细的错误提示
      if (error.message.includes("ENOTFOUND")) {
        console.log("\n💡 提示: 主机名无法解析，请检查:");
        console.log("   • 数据库主机地址是否正确");
        console.log("   • 网络连接是否正常");
      } else if (error.message.includes("ECONNREFUSED")) {
        console.log("\n💡 提示: 连接被拒绝，请检查:");
        console.log("   • PostgreSQL 服务是否正在运行");
        console.log("   • 端口号是否正确（默认 5432）");
        console.log("   • 防火墙设置");
      } else if (error.message.includes("password")) {
        console.log("\n💡 提示: 认证失败，请检查:");
        console.log("   • 用户名和密码是否正确");
        console.log("   • POSTGRES_URL 格式是否正确");
      }
    }

    process.exit(1);
  } finally {
    // 关闭连接
    if (connection) {
      await connection.end();
      console.log("\n🔌 连接已关闭");
    }
  }
};

testConnection().catch((err) => {
  console.error("❌ 测试脚本执行失败");
  console.error(err);
  process.exit(1);
});
