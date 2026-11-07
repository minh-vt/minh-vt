---
order: 110
year: '2026'
title: Kernel fusion cho LFM2.5 trong vLLM
summary: Ba kernel Triton gộp QK norm với RoPE, SiLU với lượng tử hoá FP8, và bước decode của ShortConv. Mặc định tắt, có guard và fallback về đường gốc.
metric: 48/48 test pass trên L4, tiết kiệm khoảng 9 ms mỗi request
kind: technical
source:
  label: vLLM pull request 50670
  url: https://github.com/vllm-project/vllm/pull/50670
---

LFM2.5 là mô hình lai giữa attention và short convolution. Phần lớn thời gian decode không nằm
ở tính toán mà ở băng thông bộ nhớ và số lần launch kernel.
