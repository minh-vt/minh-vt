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
      outlet: 'Báo Phú Yên',
      title: 'Gần 400 học sinh tham gia lớp học lưu động "Robot trong vỏ hạt dẻ"',
      url: 'https://baophuyen.vn/79/325055/gan-400-hoc-sinh-tham-gia-lop-hoc-luu-dong--robot-trong-vo-hat-de-.html',
    },
    {
      outlet: 'Báo Tiền Phong',
      title: 'FCT Club: câu lạc bộ lập trình với triết lý "ngược chiều"',
      url: 'https://dantri.com.vn/giao-duc/fct-club-cau-lac-bo-lap-trinh-voi-triet-ly-nguoc-chieu-20250521092910794.htm',
      date: '2025-05-21',
    },
    {
      outlet: 'Tuổi Trẻ',
      title: 'Gần 1.500 học sinh THPT dự cuộc thi về robotics',
      url: 'https://tuoitre.vn/nld/gan-1500-hoc-sinh-thpt-du-cuoc-thi-ve-robotics-196240106145620073.htm',
      date: '2024-01-06',
    },
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
      outlet: 'Phu Yen News',
      title: 'Nearly 400 students join the travelling class "A robot in a nutshell"',
      url: 'https://baophuyen.vn/79/325055/gan-400-hoc-sinh-tham-gia-lop-hoc-luu-dong--robot-trong-vo-hat-de-.html',
    },
    {
      outlet: 'Dan Tri',
      title: 'FCT Club: a programming club that works backwards',
      url: 'https://dantri.com.vn/giao-duc/fct-club-cau-lac-bo-lap-trinh-voi-triet-ly-nguoc-chieu-20250521092910794.htm',
      date: '2025-05-21',
    },
    {
      outlet: 'Tuoi Tre',
      title: 'Nearly 1,500 high school students enter a robotics contest',
      url: 'https://tuoitre.vn/nld/gan-1500-hoc-sinh-thpt-du-cuoc-thi-ve-robotics-196240106145620073.htm',
      date: '2024-01-06',
    },
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
