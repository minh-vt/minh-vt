---
order: 110
year: '2026'
title: 'Kernel fusion for LFM2.5 in vLLM'
summary: 'Three Triton kernels: QK norm fused with RoPE, SiLU fused with FP8 quantisation, and the ShortConv decode step. Off by default, guarded, and falling back to the stock path.'
metric: '48 of 48 kernel tests passing on an L4, around 9 ms saved per request'
kind: technical
source:
  label: 'vLLM pull request 50670'
  url: https://github.com/vllm-project/vllm/pull/50670
---

LFM2.5 alternates attention with short convolution. Most of a decode step is memory traffic and kernel launches rather than arithmetic.
