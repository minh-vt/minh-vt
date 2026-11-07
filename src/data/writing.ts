import type { Lang } from '../i18n/ui'

export type ExternalPost = {
  title: string
  outlet: string
  date: string
  url: string
}

/**
 * Pieces published somewhere else. Kept as data rather than as local content
 * because the canonical copy lives on the outlet's site.
 */
export const elsewhere: Record<Lang, ExternalPost[]> = {
  vi: [
    {
      outlet: 'FCT Club',
      title: 'How computer works, phần 1: từ cổng logic tới máy tính',
      date: '2023-01-07',
      url: 'https://fct-club.com/2023/01/07/how-computer-works-part-1/',
    },
    {
      outlet: 'FCT Club',
      title: 'How computer works, phần 2: số học nhị phân',
      date: '2023-01-16',
      url: 'https://fct-club.com/2023/01/16/how-computer-works-part-2/',
    },
    {
      outlet: 'FCT Club',
      title: 'Những trải nghiệm đáng nhớ tại FPT Software Quy Nhơn',
      date: '2023-04-15',
      url: 'https://fct-club.com/2023/04/15/nhung-trai-nghiem-dang-nho-tai-fpt-software-quy-nhon/',
    },
  ],
  en: [
    {
      outlet: 'FCT Club',
      title: 'How computer works, part 1: from logic gates to a computer',
      date: '2023-01-07',
      url: 'https://fct-club.com/2023/01/07/how-computer-works-part-1/',
    },
    {
      outlet: 'FCT Club',
      title: 'How computer works, part 2: binary arithmetic',
      date: '2023-01-16',
      url: 'https://fct-club.com/2023/01/16/how-computer-works-part-2/',
    },
    {
      outlet: 'FCT Club',
      title: 'A summer at FPT Software Quy Nhon',
      date: '2023-04-15',
      url: 'https://fct-club.com/2023/04/15/nhung-trai-nghiem-dang-nho-tai-fpt-software-quy-nhon/',
    },
  ],
}
