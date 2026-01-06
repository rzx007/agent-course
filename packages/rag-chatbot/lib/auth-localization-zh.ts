/**
 * Better Auth UI 完整中文本地化配置
 * 基于 @daveyplate/better-auth-ui 的 AuthLocalization 类型
 *
 * 使用方法：
 * import { zhCN } from "@/lib/auth-localization-zh";
 * <AuthUIProvider localization={zhCN} ... />
 */

export const zhCN = {
  // ============================================
  // 基本操作
  // ============================================
  SIGN_IN: "登录",
  SIGN_OUT: "退出登录",
  SIGN_UP: "注册",
  SIGN_IN_ACTION: "登录",
  SIGN_UP_ACTION: "创建账户",
  SIGN_IN_DESCRIPTION: "输入您的邮箱以登录账户",
  SIGN_UP_DESCRIPTION: "输入您的信息以创建账户",
  SIGN_IN_WITH: "使用以下方式登录",
  OR_CONTINUE_WITH: "或继续使用",

  // ============================================
  // 表单字段
  // ============================================
  EMAIL: "邮箱",
  EMAIL_PLACEHOLDER: "m@example.com",
  EMAIL_REQUIRED: "请输入邮箱地址",
  EMAIL_DESCRIPTION: "输入您用于登录的邮箱地址",
  EMAIL_INSTRUCTIONS: "请输入有效的邮箱地址",
  EMAIL_IS_THE_SAME: "邮箱相同",

  PASSWORD: "密码",
  PASSWORD_PLACEHOLDER: "密码",
  PASSWORD_REQUIRED: "请输入密码",
  PASSWORD_TOO_SHORT: "密码太短",
  PASSWORD_TOO_LONG: "密码太长",

  NEW_PASSWORD: "新密码",
  NEW_PASSWORD_PLACEHOLDER: "新密码",
  NEW_PASSWORD_REQUIRED: "请输入新密码",

  CURRENT_PASSWORD: "当前密码",
  CURRENT_PASSWORD_PLACEHOLDER: "当前密码",

  CONFIRM_PASSWORD: "确认密码",
  CONFIRM_PASSWORD_PLACEHOLDER: "确认密码",
  CONFIRM_PASSWORD_REQUIRED: "请确认密码",
  PASSWORDS_DO_NOT_MATCH: "两次密码不一致",

  NAME: "姓名",
  NAME_PLACEHOLDER: "姓名",
  NAME_DESCRIPTION: "请输入您的全名或显示名称",
  NAME_INSTRUCTIONS: "最多 32 个字符",

  USERNAME: "用户名",
  USERNAME_PLACEHOLDER: "用户名",
  USERNAME_DESCRIPTION: "输入您用于登录的用户名",
  USERNAME_INSTRUCTIONS: "最多 32 个字符",
  SIGN_IN_USERNAME_PLACEHOLDER: "用户名或邮箱",
  SIGN_IN_USERNAME_DESCRIPTION: "输入您的用户名或邮箱以登录账户",

  // ============================================
  // 账户管理
  // ============================================
  ACCOUNT: "账户",
  ACCOUNTS: "账户",
  ACCOUNTS_DESCRIPTION: "管理您当前登录的账户",
  ACCOUNTS_INSTRUCTIONS: "登录到其他账户",
  ADD_ACCOUNT: "添加账户",
  SWITCH_ACCOUNT: "切换账户",
  PERSONAL_ACCOUNT: "个人账户",

  SETTINGS: "设置",
  SECURITY: "安全",
  DELETE_ACCOUNT: "删除账户",
  DELETE_ACCOUNT_DESCRIPTION:
    "永久删除您的账户及其所有内容。此操作不可逆转，请谨慎操作。",
  DELETE_ACCOUNT_INSTRUCTIONS:
    "请确认删除您的账户。此操作不可逆转，请谨慎操作。",
  DELETE_ACCOUNT_VERIFY: "请检查您的邮箱以验证账户删除",
  DELETE_ACCOUNT_SUCCESS: "您的账户已删除",

  // ============================================
  // 密码管理
  // ============================================
  FORGOT_PASSWORD: "忘记密码",
  FORGOT_PASSWORD_LINK: "忘记密码？",
  FORGOT_PASSWORD_ACTION: "发送重置链接",
  FORGOT_PASSWORD_DESCRIPTION: "输入您的邮箱以重置密码",
  FORGOT_PASSWORD_EMAIL: "请检查您的邮箱以获取密码重置链接",

  RESET_PASSWORD: "重置密码",
  RESET_PASSWORD_ACTION: "保存新密码",
  RESET_PASSWORD_DESCRIPTION: "在下方输入您的新密码",
  RESET_PASSWORD_SUCCESS: "密码重置成功",

  CHANGE_PASSWORD: "修改密码",
  CHANGE_PASSWORD_DESCRIPTION: "输入您的当前密码和新密码",
  CHANGE_PASSWORD_INSTRUCTIONS: "请使用至少 8 个字符",
  CHANGE_PASSWORD_SUCCESS: "您的密码已修改",

  SET_PASSWORD: "设置密码",
  SET_PASSWORD_DESCRIPTION: "点击下方按钮接收邮件以为您的账户设置密码",

  // ============================================
  // 验证
  // ============================================
  EMAIL_VERIFICATION: "邮箱验证",
  EMAIL_VERIFICATION_DESCRIPTION: "请检查您的邮箱以获取验证码以完成注册",
  EMAIL_VERIFICATION_SUCCESS: "邮箱验证成功",
  VERIFY_YOUR_EMAIL: "验证您的邮箱",
  VERIFY_YOUR_EMAIL_DESCRIPTION:
    "请验证您的邮箱地址。检查您的收件箱以获取验证邮件。如果您没有收到邮件，请点击下方按钮重新发送。",
  RESEND_VERIFICATION_EMAIL: "重新发送验证邮件",
  RESEND_CODE: "重新发送验证码",
  EMAIL_VERIFY_CHANGE: "请检查您的邮箱以验证更改",

  // ============================================
  // 魔法链接
  // ============================================
  MAGIC_LINK: "魔法链接",
  MAGIC_LINK_ACTION: "发送魔法链接",
  MAGIC_LINK_DESCRIPTION: "输入您的邮箱以接收魔法链接",
  MAGIC_LINK_EMAIL: "请检查您的邮箱以获取魔法链接",

  // ============================================
  // 邮箱验证码
  // ============================================
  EMAIL_OTP: "邮箱验证码",
  EMAIL_OTP_SEND_ACTION: "发送验证码",
  EMAIL_OTP_VERIFY_ACTION: "验证验证码",
  EMAIL_OTP_DESCRIPTION: "输入您的邮箱以接收验证码",
  EMAIL_OTP_VERIFICATION_SENT: "请检查您的邮箱以获取验证码",

  // ============================================
  // 双因素认证
  // ============================================
  TWO_FACTOR: "双因素认证",
  TWO_FACTOR_PROMPT: "双因素认证",
  TWO_FACTOR_DESCRIPTION: "请输入您的一次性密码以继续",
  TWO_FACTOR_ACTION: "验证验证码",
  TWO_FACTOR_CARD_DESCRIPTION: "为您的账户添加额外的安全层",
  TWO_FACTOR_ENABLE_INSTRUCTIONS: "请输入您的密码以启用双因素认证",
  TWO_FACTOR_DISABLE_INSTRUCTIONS: "请输入您的密码以禁用双因素认证",
  ENABLE_TWO_FACTOR: "启用双因素认证",
  DISABLE_TWO_FACTOR: "禁用双因素认证",
  TWO_FACTOR_ENABLED: "双因素认证已启用",
  TWO_FACTOR_DISABLED: "双因素认证已禁用",
  TWO_FACTOR_TOTP_LABEL: "使用您的验证器扫描二维码",
  TRUST_DEVICE: "信任此设备",
  SEND_VERIFICATION_CODE: "发送验证码",

  ONE_TIME_PASSWORD: "一次性密码",
  CONTINUE_WITH_AUTHENTICATOR: "使用验证器继续",
  FORGOT_AUTHENTICATOR: "忘记验证器？",

  BACKUP_CODE: "备用代码",
  BACKUP_CODES: "备用代码",
  BACKUP_CODES_DESCRIPTION:
    "将这些备用代码保存在安全的地方。如果您丢失了双因素认证方式，可以使用它们访问您的账户。",
  BACKUP_CODE_PLACEHOLDER: "备用代码",
  BACKUP_CODE_REQUIRED: "需要备用代码",

  RECOVER_ACCOUNT: "恢复账户",
  RECOVER_ACCOUNT_ACTION: "恢复账户",
  RECOVER_ACCOUNT_DESCRIPTION: "请输入备用代码以访问您的账户",

  // ============================================
  // 通用按钮
  // ============================================
  CANCEL: "取消",
  SAVE: "保存",
  UPDATE: "更新",
  DELETE: "删除",
  CONTINUE: "继续",
  DONE: "完成",
  GO_BACK: "返回",
  LINK: "链接",
  UNLINK: "取消链接",
  REVOKE: "撤销",
  ADD: "添加",
  REMOVE: "删除",
  ACCEPT: "接受",
  REJECT: "拒绝",
  UPLOAD: "上传",

  COPY_TO_CLIPBOARD: "复制到剪贴板",
  COPY_ALL_CODES: "复制所有代码",
  COPIED_TO_CLIPBOARD: "已复制到剪贴板",

  // ============================================
  // 提示信息
  // ============================================
  REMEMBER_ME: "记住我",
  DONT_HAVE_AN_ACCOUNT: "没有账号？",
  ALREADY_HAVE_AN_ACCOUNT: "已有账号？",
  OPTIONAL_BRACKETS: "（可选）",
  IS_INVALID: "无效",
  IS_REQUIRED: "必填",
  IS_THE_SAME: "相同",

  // ============================================
  // 错误消息
  // ============================================
  INVALID_EMAIL_OR_PASSWORD: "邮箱或密码错误",
  INVALID_USERNAME_OR_PASSWORD: "用户名或密码错误",
  INVALID_PHONE_NUMBER_OR_PASSWORD: "手机号或密码错误",
  INVALID_EMAIL: "无效的邮箱地址",
  INVALID_PASSWORD: "无效的密码",
  INVALID_TOKEN: "无效的令牌",
  INVALID_CODE: "无效的验证码",
  INVALID_OTP: "无效的一次性密码",
  INVALID_USERNAME: "无效的用户名",
  INVALID_SESSION_TOKEN: "无效的会话令牌",
  INVALID_TWO_FACTOR_COOKIE: "无效的双因素认证 Cookie",
  INVALID_BACKUP_CODE: "无效的备用代码",
  INVALID_PHONE_NUMBER: "无效的手机号码",
  INVALID_API_KEY: "无效的 API 密钥",

  USER_NOT_FOUND: "用户不存在",
  USER_ALREADY_EXISTS: "用户已存在",
  USER_BANNED: "用户已被封禁",
  BANNED_USER: "已封禁的用户",

  EMAIL_NOT_VERIFIED: "邮箱未验证",
  EMAIL_VERIFICATION_REQUIRED: "需要验证邮箱",
  PHONE_NUMBER_NOT_VERIFIED: "手机号未验证",

  USERNAME_IS_ALREADY_TAKEN: "用户名已被使用",
  USERNAME_TOO_SHORT: "用户名太短",
  USERNAME_TOO_LONG: "用户名太长",
  EMAIL_CAN_NOT_BE_UPDATED: "无法更新邮箱",
  PHONE_NUMBER_EXIST: "手机号已存在",

  SESSION_EXPIRED: "会话已过期",
  SESSION_NOT_FRESH: "您的会话不是最新的，请重新登录",
  UNAUTHORIZED_SESSION: "未授权的会话",

  PASSWORD_COMPROMISED: "密码已泄露",
  USER_ALREADY_HAS_PASSWORD: "用户已设置密码",

  UNEXPECTED_ERROR: "发生意外错误",
  UNKNOWN_ERROR: "未知错误",
  REQUEST_FAILED: "请求失败",
  SERVICE_UNAVAILABLE: "服务不可用",
  VERIFICATION_FAILED: "验证失败",
  TOO_MANY_ATTEMPTS: "尝试次数过多",
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: "尝试次数过多，请请求新验证码",
  RATE_LIMIT_EXCEEDED: "超出速率限制",

  FAILED_TO_CREATE_USER: "创建用户失败",
  FAILED_TO_CREATE_SESSION: "创建会话失败",
  FAILED_TO_UPDATE_USER: "更新用户失败",
  FAILED_TO_GET_SESSION: "获取会话失败",
  COULD_NOT_CREATE_SESSION: "无法创建会话",
  UNABLE_TO_CREATE_SESSION: "无法创建会话",

  SOCIAL_ACCOUNT_ALREADY_LINKED: "社交账户已关联",
  PROVIDER_NOT_FOUND: "未找到提供商",
  FAILED_TO_GET_USER_INFO: "获取用户信息失败",
  USER_EMAIL_NOT_FOUND: "未找到用户邮箱",
  ID_TOKEN_NOT_SUPPORTED: "不支持 ID 令牌",
  INVALID_OAUTH_CONFIGURATION: "无效的 OAuth 配置",

  CREDENTIAL_ACCOUNT_NOT_FOUND: "未找到凭证账户",
  ACCOUNT_NOT_FOUND: "未找到账户",
  FAILED_TO_UNLINK_LAST_ACCOUNT: "无法取消关联最后一个账户",

  OTP_NOT_ENABLED: "未启用一次性密码",
  OTP_HAS_EXPIRED: "一次性密码已过期",
  OTP_NOT_FOUND: "未找到一次性密码",
  OTP_EXPIRED: "一次性密码已过期",
  TOTP_NOT_ENABLED: "未启用基于时间的一次性密码",
  TWO_FACTOR_NOT_ENABLED: "未启用双因素认证",
  BACKUP_CODES_NOT_ENABLED: "未启用备用代码",

  CHALLENGE_NOT_FOUND: "未找到挑战",
  PASSKEY_NOT_FOUND: "未找到通行密钥",
  AUTHENTICATION_FAILED: "认证失败",
  FAILED_TO_VERIFY_REGISTRATION: "验证注册失败",
  FAILED_TO_UPDATE_PASSKEY: "更新通行密钥失败",
  YOU_ARE_NOT_ALLOWED_TO_REGISTER_THIS_PASSKEY: "您无权注册此通行密钥",

  MISSING_SECRET_KEY: "缺少密钥",
  MISSING_RESPONSE: "缺少响应",
  INVALID_METADATA_TYPE: "无效的元数据类型",
  NO_VALUES_TO_UPDATE: "没有要更新的值",
  SERVER_ONLY_PROPERTY: "仅服务器属性",

  ANONYMOUS_USERS_CANNOT_SIGN_IN_AGAIN_ANONYMOUSLY: "匿名用户无法再次匿名登录",
  YOU_CANNOT_BAN_YOURSELF: "您不能封禁自己",

  YOU_ARE_NOT_ALLOWED_TO_CHANGE_USERS_ROLE: "您无权更改用户角色",
  YOU_ARE_NOT_ALLOWED_TO_CREATE_USERS: "您无权创建用户",
  YOU_ARE_NOT_ALLOWED_TO_LIST_USERS: "您无权列出用户",
  YOU_ARE_NOT_ALLOWED_TO_LIST_USERS_SESSIONS: "您无权列出用户会话",
  YOU_ARE_NOT_ALLOWED_TO_BAN_USERS: "您无权封禁用户",
  YOU_ARE_NOT_ALLOWED_TO_IMPERSONATE_USERS: "您无权模拟用户",
  YOU_ARE_NOT_ALLOWED_TO_REVOKE_USERS_SESSIONS: "您无权撤销用户会话",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_USERS: "您无权删除用户",
  YOU_ARE_NOT_ALLOWED_TO_SET_USERS_PASSWORD: "您无权设置用户密码",

  // ============================================
  // 成功消息
  // ============================================
  UPDATED_SUCCESSFULLY: "更新成功",
  SIGN_UP_EMAIL: "请检查您的邮箱以获取验证链接",

  // ============================================
  // 组织管理
  // ============================================
  ORGANIZATION: "组织",
  ORGANIZATIONS: "组织",
  ORGANIZATIONS_DESCRIPTION: "管理您的组织和成员资格",
  ORGANIZATIONS_INSTRUCTIONS: "创建组织以与其他用户协作",

  CREATE_ORGANIZATION: "创建组织",
  CREATE_ORGANIZATION_SUCCESS: "组织创建成功",
  MANAGE_ORGANIZATION: "管理组织",
  LEAVE_ORGANIZATION: "离开组织",
  LEAVE_ORGANIZATION_CONFIRM: "您确定要离开此组织吗？",
  LEAVE_ORGANIZATION_SUCCESS: "您已成功离开组织",
  DELETE_ORGANIZATION: "删除组织",
  DELETE_ORGANIZATION_DESCRIPTION:
    "永久删除您的组织及其所有内容。此操作不可逆转，请谨慎操作。",
  DELETE_ORGANIZATION_SUCCESS: "组织已成功删除",
  DELETE_ORGANIZATION_INSTRUCTIONS: "输入组织标识以继续：",

  ORGANIZATION_NAME: "组织名称",
  ORGANIZATION_NAME_PLACEHOLDER: "Acme 公司",
  ORGANIZATION_NAME_DESCRIPTION: "这是您组织的可见名称",
  ORGANIZATION_NAME_INSTRUCTIONS: "最多 32 个字符",

  ORGANIZATION_SLUG: "组织标识",
  ORGANIZATION_SLUG_PLACEHOLDER: "acme-inc",
  ORGANIZATION_SLUG_DESCRIPTION: "这是您组织的 URL 命名空间",
  ORGANIZATION_SLUG_INSTRUCTIONS: "最多 48 个字符",
  SLUG_REQUIRED: "组织标识是必填项",
  SLUG_DOES_NOT_MATCH: "标识不匹配",

  ORGANIZATION_NOT_FOUND: "未找到组织",
  ORGANIZATION_ALREADY_EXISTS: "组织已存在",
  USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION: "用户不是组织成员",
  USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION: "用户已是此组织的成员",
  NO_ACTIVE_ORGANIZATION: "没有活跃的组织",
  NOT_ORGANIZATION_MEMBER: "不是组织成员",
  ORGANIZATION_MEMBERSHIP_LIMIT_REACHED: "组织成员数量已达上限",

  YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_ORGANIZATION: "您无权创建新组织",
  YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_ORGANIZATIONS: "您已达到组织数量上限",
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION: "您无权更新此组织",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_ORGANIZATION: "您无权删除此组织",
  YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER:
    "作为唯一所有者，您无法离开组织",

  // ============================================
  // 成员管理
  // ============================================
  MEMBERS: "成员",
  MEMBERS_DESCRIPTION: "添加或删除成员并管理其角色",
  MEMBERS_INSTRUCTIONS: "邀请新成员加入您的组织",
  MEMBER_SINGULAR: "成员",
  MEMBER_PLURAL: "成员",

  INVITE_MEMBER: "邀请成员",
  INVITE_MEMBER_DESCRIPTION: "发送邀请以添加新成员到您的组织",
  SEND_INVITATION: "发送邀请",
  SEND_INVITATION_SUCCESS: "邀请已成功发送",

  REMOVE_MEMBER: "移除成员",
  REMOVE_MEMBER_CONFIRM: "您确定要将此成员从组织中移除吗？",
  REMOVE_MEMBER_SUCCESS: "成员已成功移除",

  MEMBER_NOT_FOUND: "未找到成员",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_MEMBER: "您无权删除此成员",

  ROLE: "角色",
  SELECT_ROLE: "选择角色",
  ROLE_NOT_FOUND: "未找到角色",
  ADMIN: "管理员",
  GUEST: "访客",
  OWNER: "所有者",

  UPDATE_ROLE: "更新角色",
  UPDATE_ROLE_DESCRIPTION: "更新此成员的角色",
  MEMBER_ROLE_UPDATED: "成员角色已成功更新",
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_MEMBER: "您无权更新此成员",
  YOU_ARE_NOT_ALLOWED_TO_INVITE_USER_WITH_THIS_ROLE:
    "您无权邀请具有此角色的用户",

  // ============================================
  // 邀请管理
  // ============================================
  PENDING_INVITATIONS: "待处理邀请",
  PENDING_INVITATIONS_DESCRIPTION: "管理组织的待处理邀请",
  PENDING_USER_INVITATIONS_DESCRIPTION: "您收到的来自组织的邀请",

  ACCEPT_INVITATION: "接受邀请",
  ACCEPT_INVITATION_DESCRIPTION: "您已被邀请加入组织",
  INVITATION_ACCEPTED: "邀请已成功接受",
  INVITATION_REJECTED: "邀请已成功拒绝",
  INVITATION_CANCELLED: "邀请已成功取消",
  INVITATION_EXPIRED: "此邀请已过期",
  CANCEL_INVITATION: "取消邀请",

  INVITATION_NOT_FOUND: "未找到邀请",
  INVITATION_LIMIT_REACHED: "邀请数量已达上限",
  USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION: "用户已被邀请到此组织",
  YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION: "您不是邀请的接收者",
  YOU_ARE_NOT_ALLOWED_TO_CANCEL_THIS_INVITATION: "您无权取消此邀请",
  YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_ORGANIZATION:
    "您无权邀请用户到此组织",
  INVITER_IS_NO_LONGER_A_MEMBER_OF_THE_ORGANIZATION: "邀请者不再是组织成员",
  FAILED_TO_RETRIEVE_INVITATION: "检索邀请失败",

  // ============================================
  // 团队管理
  // ============================================
  TEAM: "团队",
  TEAMS: "团队",
  TEAMS_DESCRIPTION: "管理您组织内的团队",
  USER_TEAMS_DESCRIPTION: "您是以下团队的成员",
  NO_TEAMS_FOUND: "未找到团队",

  CREATE_TEAM: "创建团队",
  CREATE_TEAM_INSTRUCTIONS: "向您的组织添加新团队",
  CREATE_TEAM_SUCCESS: "团队创建成功",

  UPDATE_TEAM: "更新团队",
  UPDATE_TEAMS: "更新团队",
  UPDATE_TEAM_DESCRIPTION: "更新此团队的名称",
  UPDATE_TEAMS_DESCRIPTION: "为此成员添加或删除团队",
  UPDATE_TEAM_SUCCESS: "团队更新成功",
  SELECT_TEAMS: "选择团队",

  DELETE_TEAM: "删除团队",
  DELETE_TEAM_DESCRIPTION: "永久删除此团队及其所有内容",
  DELETE_TEAM_SUCCESS: "团队已成功删除",
  DELETE_TEAM_INSTRUCTIONS: "输入团队名称以继续：",
  REMOVE_TEAM_CONFIRM: "您确定要从组织中删除此团队吗？",

  TEAM_NAME: "团队名称",
  TEAM_NAME_PLACEHOLDER: "工程团队",
  TEAM_NAME_DESCRIPTION: "这是您团队的可见名称",
  TEAM_NAME_INSTRUCTIONS: "最多 64 个字符",
  TEAM_NAME_REQUIRED: "团队名称是必填项",
  TEAM_NAME_DOES_NOT_MATCH: "团队名称不匹配",

  TEAM_ACTIVE: "活跃",
  TEAM_SET_ACTIVE: "设为活跃",

  TEAM_NOT_FOUND: "未找到团队",
  TEAM_ALREADY_EXISTS: "团队已存在",
  TEAM_LIMIT_REACHED: "团队数量已达上限",
  TEAM_MEMBER_LIMIT_REACHED: "团队成员数量已达上限",
  TEAM_MEMBER_NOT_FOUND: "未找到团队成员",
  TEAM_NAME_TOO_LONG: "团队名称太长",
  ALREADY_TEAM_MEMBER: "已是团队成员",
  CANNOT_REMOVE_LAST_TEAM: "无法删除最后一个团队",
  UNABLE_TO_REMOVE_LAST_TEAM: "无法删除最后一个团队",
  INSUFFICIENT_TEAM_PERMISSIONS: "团队权限不足",

  YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM: "您无权创建新团队",
  YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_TEAMS: "您已达到团队数量上限",
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_TEAM: "您无权更新此团队",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_TEAM: "您无权删除此团队",
  YOU_ARE_NOT_ALLOWED_TO_CREATE_TEAMS_IN_THIS_ORGANIZATION:
    "您无权在此组织中创建团队",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_TEAMS_IN_THIS_ORGANIZATION:
    "您无权在此组织中删除团队",

  TEAM_MEMBERS: "团队成员",
  TEAM_MEMBERS_DESCRIPTION: "管理您的团队成员及其角色",
  MANAGE_TEAM_MEMBERS: "管理团队成员",
  MANAGE_TEAM_MEMBERS_DESCRIPTION: "搜索并添加组织成员到此团队",
  ADD_TEAM_MEMBER: "添加团队成员",
  ADD_TEAM_MEMBER_SUCCESS: "团队成员已成功添加",
  REMOVE_TEAM_MEMBER: "删除团队成员",
  REMOVE_TEAM_MEMBER_CONFIRM: "您确定要将此成员从团队中移除吗？",
  REMOVE_TEAM_MEMBER_SUCCESS: "团队成员已成功移除",

  // ============================================
  // 会话管理
  // ============================================
  SESSIONS: "会话",
  SESSIONS_DESCRIPTION: "管理您的活跃会话并撤销访问权限",
  CURRENT_SESSION: "当前会话",

  // ============================================
  // 通行密钥 (Passkey)
  // ============================================
  PASSKEY: "通行密钥",
  PASSKEYS: "通行密钥",
  PASSKEYS_DESCRIPTION: "管理您的通行密钥以实现安全访问",
  PASSKEYS_INSTRUCTIONS: "在不使用密码的情况下安全访问您的账户",
  ADD_PASSKEY: "添加通行密钥",

  // ============================================
  // API 密钥
  // ============================================
  API_KEY: "API 密钥",
  API_KEYS: "API 密钥",
  API_KEYS_DESCRIPTION: "管理您的 API 密钥以实现安全访问",
  API_KEYS_INSTRUCTIONS: "生成 API 密钥以编程方式访问您的账户",

  CREATE_API_KEY: "创建 API 密钥",
  CREATE_API_KEY_DESCRIPTION: "为您的 API 密钥输入唯一名称以区分其他密钥",
  CREATE_API_KEY_SUCCESS:
    "请复制您的 API 密钥并将其保存在安全的地方。出于安全考虑，我们无法再次显示它。",
  API_KEY_CREATED: "API 密钥已创建",
  API_KEY_NAME_PLACEHOLDER: "新 API 密钥",

  DELETE_API_KEY: "删除 API 密钥",
  DELETE_API_KEY_CONFIRM: "您确定要删除此 API 密钥吗？",

  NEVER_EXPIRES: "永不过期",
  EXPIRES: "过期",
  NO_EXPIRATION: "无过期时间",

  KEY_NOT_FOUND: "未找到密钥",
  KEY_DISABLED: "密钥已禁用",
  KEY_EXPIRED: "密钥已过期",
  KEY_DISABLED_EXPIRATION: "密钥已禁用（过期）",
  KEY_NOT_RECOVERABLE: "密钥不可恢复",
  USAGE_EXCEEDED: "使用量超出限制",
  EXPIRES_IN_IS_TOO_SMALL: "过期时间太短",
  EXPIRES_IN_IS_TOO_LARGE: "过期时间太长",
  INVALID_REMAINING: "无效的剩余量",
  INVALID_PREFIX_LENGTH: "无效的前缀长度",
  INVALID_NAME_LENGTH: "无效的名称长度",
  INVALID_USER_ID_FROM_API_KEY: "API 密钥中的用户 ID 无效",
  INVALID_API_KEY_GETTER_RETURN_TYPE: "API 密钥获取器返回类型无效",
  METADATA_DISABLED: "元数据已禁用",
  REFILL_AMOUNT_AND_INTERVAL_REQUIRED: "需要补充数量和间隔",
  REFILL_INTERVAL_AND_AMOUNT_REQUIRED: "需要补充间隔和数量",

  // ============================================
  // 头像和 Logo
  // ============================================
  AVATAR: "头像",
  AVATAR_DESCRIPTION: "点击头像从您的文件中上传自定义头像",
  AVATAR_INSTRUCTIONS: "头像是可选的，但强烈推荐",
  UPLOAD_AVATAR: "上传头像",
  DELETE_AVATAR: "删除头像",

  LOGO: "Logo",
  LOGO_DESCRIPTION: "点击 Logo 从您的文件中上传自定义 Logo",
  LOGO_INSTRUCTIONS: "Logo 是可选的，但强烈推荐",
  UPLOAD_LOGO: "上传 Logo",
  DELETE_LOGO: "删除 Logo",

  // ============================================
  // 提供商
  // ============================================
  PROVIDERS: "提供商",
  PROVIDERS_DESCRIPTION: "将您的账户与第三方服务连接",
  DISABLED_CREDENTIALS_DESCRIPTION: "选择提供商登录您的账户",

  // ============================================
  // 订阅相关（如果使用）
  // ============================================
  SUBSCRIPTION_NOT_FOUND: "未找到订阅",
  SUBSCRIPTION_PLAN_NOT_FOUND: "未找到订阅计划",
  ALREADY_SUBSCRIBED_PLAN: "已订阅计划",
  UNABLE_TO_CREATE_CUSTOMER: "无法创建客户",
  FAILED_TO_FETCH_PLANS: "获取计划失败",
  SUBSCRIPTION_NOT_ACTIVE: "订阅未激活",
  SUBSCRIPTION_NOT_SCHEDULED_FOR_CANCELLATION: "订阅未计划取消",

  // ============================================
  // 其他
  // ============================================
  APP: "应用",
  USER: "用户",
  UNKNOWN: "未知",

  PRIVACY_POLICY: "隐私政策",
  TERMS_OF_SERVICE: "服务条款",
  PROTECTED_BY_RECAPTCHA: "此站点受 reCAPTCHA 保护",
  BY_CONTINUING_YOU_AGREE: "继续即表示您同意",
} as const;
