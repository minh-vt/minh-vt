import type { Lang } from '../i18n/ui'

export type PressItem = {
  outlet: string
  title: string
  url: string
  date?: string
}

/**
 * Third party pages that corroborate the timeline. Hand maintained on purpose:
 * a dead link should fail review, not a build.
 */
export const press: Record<Lang, PressItem[]> = {
  vi: [
    {
      outlet: 'Báo Tiền Phong',
      title: 'Cựu học sinh THPT chuyên Lương Văn Chánh giúp teen Đắk Lắk chinh phục AI',
      url: 'https://hoahoctro.tienphong.vn/cuu-hoc-sinh-thpt-chuyen-luong-van-chanh-giup-teen-dak-lak-chinh-phuc-ai-post1870716.tpo',
      date: '2026-08-26',
    },
    {
      outlet: 'FPT University',
      title: 'FARC 2025: danh sách các đội đạt giải vòng chung kết toàn quốc',
      url: 'https://daihoc.fpt.edu.vn/tin-noi-bat-muc-tin-tuc/fptu-ai-robotics-challenge-2025-danh-sach-cac-doi-dat-giai-tai-vong-chung-ket-toan-quoc/',
      date: '2025-08-03',
    },
    {
      outlet: 'FIRST Tech Challenge',
      title: 'Vietnam Championship 2025, Compass Award',
      url: 'https://ftcscout.org/events/2024/VNCMP/awards',
      date: '2025-02-23',
    },
    {
      outlet: 'Báo Phú Yên',
      title: 'Trường THPT chuyên Lương Văn Chánh đoạt giải Compass Award',
      url: 'https://tptuyhoa.phuyen.gov.vn/cac-tin-khac/truong-thpt-chuyen-luong-van-chanh-doat-giai-compass-award-788948',
      date: '2025-02-26',
    },
    {
      outlet: 'FCT Club',
      title: 'Giải thưởng và danh hiệu học viên năm học 2022–2023',
      url: 'https://fct-club.com/2023/08/09/giai-thuong-pt-hannah-va-cac-danh-hieu-cua-hoc-vien-nam-hoc-2022-2023/',
      date: '2023-08-09',
    },
    {
      outlet: 'FCT Club',
      title: 'Từ sự tò mò đến đam mê bất tận với lập trình',
      url: 'https://fct-club.com/2023/06/02/tu-su-to-mo-den-dam-me-bat-tan-voi-lap-trinh/',
      date: '2023-06-02',
    },
    {
      outlet: 'THPT Lương Văn Chánh',
      title: 'Học sinh trường chuyên và dự án Du lịch qua thế giới ảo',
      url: 'https://luongvanchanh.daklak.edu.vn/tin-tuc-su-kien/hoat-dong-ngoai-gio-len-lop/hoc-sinh-truong-chuyen-va-du-an-du-lich-qua-the-gioi-ao.html',
      date: '2023-03-22',
    },
    {
      outlet: 'vLLM',
      title: 'Pull request #50670: fused decode kernels for LFM2.5',
      url: 'https://github.com/vllm-project/vllm/pull/50670',
      date: '2026-08-01',
    },
  ],
  en: [
    {
      outlet: 'Tien Phong',
      title: 'Former Luong Van Chanh students help Dak Lak teenagers take on AI',
      url: 'https://hoahoctro.tienphong.vn/cuu-hoc-sinh-thpt-chuyen-luong-van-chanh-giup-teen-dak-lak-chinh-phuc-ai-post1870716.tpo',
      date: '2026-08-26',
    },
    {
      outlet: 'FPT University',
      title: 'FARC 2025 national final results',
      url: 'https://daihoc.fpt.edu.vn/tin-noi-bat-muc-tin-tuc/fptu-ai-robotics-challenge-2025-danh-sach-cac-doi-dat-giai-tai-vong-chung-ket-toan-quoc/',
      date: '2025-08-03',
    },
    {
      outlet: 'FIRST Tech Challenge',
      title: 'Vietnam Championship 2025, Compass Award',
      url: 'https://ftcscout.org/events/2024/VNCMP/awards',
      date: '2025-02-23',
    },
    {
      outlet: 'Phu Yen News',
      title: 'Luong Van Chanh High School receives the Compass Award',
      url: 'https://tptuyhoa.phuyen.gov.vn/cac-tin-khac/truong-thpt-chuyen-luong-van-chanh-doat-giai-compass-award-788948',
      date: '2025-02-26',
    },
    {
      outlet: 'FCT Club',
      title: 'Student awards, academic year 2022–2023',
      url: 'https://fct-club.com/2023/08/09/giai-thuong-pt-hannah-va-cac-danh-hieu-cua-hoc-vien-nam-hoc-2022-2023/',
      date: '2023-08-09',
    },
    {
      outlet: 'FCT Club',
      title: 'From curiosity to a lasting interest in programming',
      url: 'https://fct-club.com/2023/06/02/tu-su-to-mo-den-dam-me-bat-tan-voi-lap-trinh/',
      date: '2023-06-02',
    },
    {
      outlet: 'Luong Van Chanh HS',
      title: 'A student project: travelling the world in virtual reality',
      url: 'https://luongvanchanh.daklak.edu.vn/tin-tuc-su-kien/hoat-dong-ngoai-gio-len-lop/hoc-sinh-truong-chuyen-va-du-an-du-lich-qua-the-gioi-ao.html',
      date: '2023-03-22',
    },
    {
      outlet: 'vLLM',
      title: 'Pull request #50670: fused decode kernels for LFM2.5',
      url: 'https://github.com/vllm-project/vllm/pull/50670',
      date: '2026-08-01',
    },
  ],
}
