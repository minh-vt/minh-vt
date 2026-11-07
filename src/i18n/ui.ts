export const languages = {
  vi: 'Tiếng Việt',
  en: 'English',
} as const

export type Lang = keyof typeof languages

export const defaultLang: Lang = 'vi'

export const ui = {
  vi: {
    'site.name': 'Vũ Tùng Minh',
    'nav.home': 'Trang chủ',
    'nav.writing': 'Bài viết',
    'nav.timeline': 'Các mốc',
    'nav.contact': 'Liên hệ',
    'nav.skip': 'Tới nội dung',
    'meta.description':
      'Vũ Tùng Minh: kỹ sư phần mềm nhúng, đồng sáng lập Science Lab, làm việc với các đội robotics ở Phú Yên.',
    'section.about': 'Giới thiệu',
    'section.timeline': 'Các mốc',
    'section.timeline.lead': 'Từ 2020 tới nay, xếp theo thứ tự thời gian.',
    'section.sources': 'Nguồn',
    'section.sources.lead': 'Những dòng dưới đây là nơi kiểm chứng được các mốc ở trên.',
    'section.writing': 'Bài viết',
    'section.writing.lead': 'Ghi chép kỹ thuật, viết khi có gì đáng viết.',
    'section.contact': 'Liên hệ',
    'section.contact.lead': 'Email là cách nhanh nhất.',
    'blog.empty': 'Chưa có bài viết nào.',
    'blog.origin': 'Đăng lần đầu trên',
    'blog.back': 'Tất cả bài viết',
    'blog.reading': 'phút đọc',
    'blog.inLanguage': 'Ngôn ngữ:',
    'theme.label': 'Đổi giao diện',
    'theme.light': 'Nền sáng',
    'theme.dark': 'Nền tối',
    'lang.label': 'Đổi ngôn ngữ',
    'footer.rights': 'Nội dung và hình ảnh thuộc về Vũ Tùng Minh.',
    'notfound.title': 'Không tìm thấy trang',
    'notfound.body': 'Đường dẫn này không tồn tại, hoặc đã bị đổi.',
    'notfound.action': 'Về trang chủ',
  },
  en: {
    'site.name': 'Vu Tung Minh',
    'nav.home': 'Home',
    'nav.writing': 'Writing',
    'nav.timeline': 'Timeline',
    'nav.contact': 'Contact',
    'nav.skip': 'Skip to content',
    'meta.description':
      'Vu Tung Minh: embedded software engineer, co-founder of Science Lab, working with robotics teams in Phu Yen.',
    'section.about': 'About',
    'section.timeline': 'Timeline',
    'section.timeline.lead': 'From 2020 to now, in the order things happened.',
    'section.sources': 'Sources',
    'section.sources.lead': 'Each line below is where the entries above can be checked.',
    'section.writing': 'Writing',
    'section.writing.lead':
      'Technical notes, written when there is something worth writing.',
    'section.contact': 'Contact',
    'section.contact.lead': 'Email is the fastest way.',
    'blog.empty': 'No posts yet.',
    'blog.origin': 'First published on',
    'blog.back': 'All posts',
    'blog.reading': 'min read',
    'blog.inLanguage': 'Language:',
    'theme.label': 'Switch theme',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'lang.label': 'Switch language',
    'footer.rights': 'Content and images belong to Vu Tung Minh.',
    'notfound.title': 'Page not found',
    'notfound.body': 'This path does not exist, or it moved.',
    'notfound.action': 'Back to home',
  },
} as const satisfies Record<Lang, Record<string, string>>

export type UIKey = keyof (typeof ui)[typeof defaultLang]
