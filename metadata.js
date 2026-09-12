/* Detailed condition-specific values and implementation notes. */
window.ES_METADATA = {
  yu2020: {
    memoryEfficiency: "-（原文未给出独立 memory retrieval efficiency）",
    interfaceEfficiency: "QFC end-to-end 33%；PPLN-WG peak conversion 约 70%",
    mechanism: "795 nm write-out 经 AMZI + fast Pockels cell 从 polarization 转为 time-bin，再由 1,950 nm 泵浦的 PPLN-WG DFG 转到 1,342 nm O-band。22 km TPI 使用两条 11 km field fibre（约 8 dB 总衰减），电控 polarization compensation、98% 平均过滤效率和约 280 Hz 背景。50 km SPI 在 1,550 nm auxiliary beam 上做连续相位监测；光电信号反馈 fibre stretcher，抵消长纤相对相位漂移。",
    evidenceDetail: "PDF pp. 2–4；Fig. 1–6；Table 1。"
  },
  luo2026: {
    memoryEfficiency: "-（原文未给出独立 memory retrieval efficiency）",
    interfaceEfficiency: "QFC end-to-end 约 44%；1522 nm fiber loss 约 0.18 dB/km",
    mechanism: "780 nm DLCZ write-out 由 1,600 nm pump 驱动 PPLN-WG DFG 转为 1,522 nm S-band；Alice/Bob 各有 cavity-enhanced ensemble。1600 nm far-off-resonant probe 沿同一光路全时运行，在 Charlie 处经 WDM/BS/APD 读出相位并反馈 EOM，抑制高频噪声；额外 dual-band probe（相对 write-out ±675 MHz）和 intermittent loop 补偿低频漂移，read-out loop 的锁相信号反馈 piezoelectric fibre stretcher。420 km 时把 coiled G.654.E ultralow-loss fibre 与 10.1 km deployed fibre 组合，总损耗 78.7 dB；QFC 后使用 DM/LP/SP 宽带滤波，再用 etalon + VBG + LP/BP 窄带滤波，滤波器放入 insulated boxes；最终用约 1 Hz dark-count、约 60%/30% efficiency 的 SNSPD D1/D2。",
    evidenceDetail: "发表版 PDF pp. 1–5；Fig. 1–4；Table I。摘要的“≥320 km 超过 PLOB”和 Fig. 4 的约 230 km 拟合交叉点保留为两种口径。"
  },
  zhu2025: {
    memoryEfficiency: "100 μs AFC：16.6±0.1%（A）/15.7±0.1%（B）；单次 storage efficiency 19.5±0.9%/18.6±0.4%",
    interfaceEfficiency: "cSPDC signal heralding 34%/36%；bandwidth matching 约 90%/91%；deployed fibre loss 1.54 dB（7.9 km）/3.24 dB（9.9 km）",
    mechanism: "¹⁵¹Eu³⁺:Y₂SiO₅ 的 20 MHz AFC 在约 99.55 μs 输入窗内同时接收 1205 个 temporal modes，并在 100 μs 后回波。C 节点接收 1537 nm idler，在 BS 做 TPI；两个检测事件的 time tags 配对后，A/B 端按 BSM 结果用 EOM 做局域 Pauli/feed-forward。时间测量把连续模式映射为 time-bin/polarization 观测，不依赖长程主动 phase lock；核心速率提升来自 1205-mode duty cycle，而不是提高线性 BSM 上限。",
    evidenceDetail: "arXiv v2 全文 pp. 1、4、12–14；Supplementary Fig. S12–S15、Table S4。"
  },
  lago2021: {
    memoryEfficiency: "-（该文主要报告 concurrence/有效 fidelity，未给独立 AFC efficiency）",
    interfaceEfficiency: "heralding rate 1.43 kHz；可由泵浦功率提高至约 15.6 kHz（设计估计）",
    mechanism: "每个节点用 cavity-SPDC 产生 606 nm signal + 1436 nm telecom idler；signal 进入 Pr³⁺:Y₂SiO₅ AFC，idler 在中央 fibre BS 做 single-click SPI。两条 idler 路径以 photodiode + intermittent lock + piezo fibre stretcher 稳相；signal 读出后再经约 75 m interferometer 做 concurrence 验证，另一套 detuned locking light 不扰动 AFC。AFC 连续接收 62 个 temporal modes，通信等待时不必先等 herald 返回。",
    evidenceDetail: "arXiv PDF pp. 2–4；Fig. 1–4；2 μs 时 V=84(2)%/84(4)%、C=1.15(5)×10⁻²、晶体端回溯 C≈7.3(5)×10⁻²。"
  },
  liu2021: {
    memoryEfficiency: "14.3±0.1%（A）/12.5±0.1%（B），55.6 ns；memory fidelity 96.6±0.9%/97.0±0.4%",
    interfaceEfficiency: "平均 heralding rate 约 100 Hz；EDR 约 1.1 h⁻¹",
    mechanism: "每个 Nd³⁺:YVO₄ AFC memory 接收外置 type-II SPDC 的 580 nm signal；1537 nm telecom photon 送到中央 BSM。AFC 的 absorptive architecture 与光源解耦，可预先存入约 4 个可区分 temporal modes（潜在约 56 modes）；中央 coincidence 后读取两端 memory，做三组 Pauli tomography 得到 Bell fidelity。",
    evidenceDetail: "arXiv PDF pp. 1、5–7；Methods。"
  },
  stolk2024: {
    memoryEfficiency: "-",
    interfaceEfficiency: "-（论文以 postselected rate 0.48 Hz、fully-live fidelity 为主）",
    mechanism: "独立 diamond spin nodes 采用 single-click SPI 和 L-band QFC；same-fibre stabilization 让通信光与相位参考共路，多重 phase-lock loop 抑制 fibre phase drift。FPGA/实时控制器读取 which-detector outcome，在 herald 返回后立即执行 detector-dependent phase flip/feed-forward，因此交付的是 fully-live Bell state，而不是事后筛选的统计态。",
    evidenceDetail: "PMC 开放全文；deployed 25 km fibre、10 km node separation、fully-live F=0.534±0.015。"
  },
  knaut2024: {
    memoryEfficiency: "-",
    interfaceEfficiency: "electron entanglement rate up to 1 Hz",
    mechanism: "SiV nanophotonic cavity 产生 time-bin spin–photon interface；连续两次 spin–photon gate 和 detector outcome feed-forward 实现 sequential entangling gate，不要求整条长链路保持单一 optical phase。²⁹Si nuclear spin 作为 long-lived register，并用 dynamical decoupling 将纠缠保持到约 1 s。",
    evidenceDetail: "PMC 开放全文；40 km spool、35 km Boston deployed loop、约 17 dB link loss。"
  }
};
