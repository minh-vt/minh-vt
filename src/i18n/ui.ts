export const languages = {
  vi: 'Tiếng Việt',
  en: 'English',
} as const

export type Lang = keyof typeof languages

export const defaultLang: Lang = 'vi'

export const ui = {
  vi: {
    'site.name': 'Vũ Tùng Minh',
    'site.title': 'Vũ Tùng Minh, kỹ sư phần mềm nhúng và robotics',
    'meta.description':
      'Vũ Tùng Minh, kỹ sư phần mềm nhúng ở TP. Hồ Chí Minh. Camera pipeline trên Rockchip, kernel cho vLLM, và huấn luyện robotics ở Phú Yên.',

    'nav.home': 'Trang chủ',
    'nav.writing': 'Bài viết',
    'nav.timeline': 'Các mốc',
    'nav.sources': 'Nguồn',
    'nav.contact': 'Liên hệ',
    'nav.menu': 'Mục lục',
    'nav.skip': 'Tới nội dung',

    'facts.basedIn': 'Nơi ở',
    'facts.now': 'Hiện tại',
    'facts.since': 'Lập trình từ',

    'section.timeline': 'Các mốc',
    'timeline.hint': 'Mở từng mốc để xem nguồn.',
    'section.writing': 'Bài viết',
    'section.writing.lead': 'Ghi chép kỹ thuật, không đăng đều.',
    'section.sources': 'Nguồn',
    'section.sources.lead': 'Bên thứ ba xác nhận, không phải tự khai.',
    'section.contact': 'Liên hệ',
    'section.contact.lead':
      'Viết cho mình về công việc kỹ thuật, về robotics, hoặc một câu hỏi cụ thể.',

    'blog.back': 'Tất cả bài viết',
    'blog.empty': 'Chưa có bài viết nào.',
    'blog.reading': 'phút đọc',
    'blog.updated': 'Cập nhật',
    'blog.origin': 'Đăng lần đầu trên',
    'blog.inLanguage': 'Ngôn ngữ:',

    'theme.label': 'Đổi giao diện',
    'theme.light': 'Nền sáng',
    'theme.dark': 'Nền tối',
    'lang.label': 'Đổi ngôn ngữ',

    'notfound.title': 'Không tìm thấy trang',
    'notfound.body': 'Đường dẫn này không tồn tại, hoặc đã bị đổi.',
    'notfound.action': 'Về trang chủ',
  },
  en: {
    'site.name': 'Vu Tung Minh',
    'site.title': 'Vu Tung Minh, embedded software engineer and robotics coach',
    'meta.description':
      'Vu Tung Minh, embedded software engineer in Ho Chi Minh City. Camera pipelines on Rockchip, kernels for vLLM, and robotics coaching in Phu Yen.',

    'nav.home': 'Home',
    'nav.writing': 'Writing',
    'nav.timeline': 'Timeline',
    'nav.sources': 'Sources',
    'nav.contact': 'Contact',
    'nav.menu': 'Menu',
    'nav.skip': 'Skip to content',

    'facts.basedIn': 'Based in',
    'facts.now': 'Now',
    'facts.since': 'Coding since',

    'section.timeline': 'Timeline',
    'timeline.hint': 'Open a milestone to see its sources.',
    'section.writing': 'Writing',
    'section.writing.lead': 'Technical notes, not on a schedule.',
    'section.sources': 'Sources',
    'section.sources.lead': 'Confirmed by someone else, not self-reported.',
    'section.contact': 'Contact',
    'section.contact.lead': 'Write to me about engineering work, robotics, or one specific question.',

    'blog.back': 'All posts',
    'blog.empty': 'No posts yet.',
    'blog.reading': 'min read',
    'blog.updated': 'Updated',
    'blog.origin': 'First published on',
    'blog.inLanguage': 'Language:',

    'theme.label': 'Switch theme',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'lang.label': 'Switch language',

    'notfound.title': 'Page not found',
    'notfound.body': 'This path does not exist, or it moved.',
    'notfound.action': 'Back to home',
  },
} as const satisfies Record<Lang, Record<string, string>>

export type UIKey = keyof (typeof ui)[typeof defaultLang]
