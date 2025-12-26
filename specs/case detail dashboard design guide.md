在 Case 详情页引入 **Dashboard（仪表盘）**，实际上是将律师从“在大海里找针”（翻阅文档找问题）升级为“看着雷达开船”（基于数据做决策）。

对于**个人案件（如移民/签证）**，虽然案情本身不如商业并购复杂，但其**流程标准化程度高、时间节点敏感、且高度依赖客户配合**。

基于我们之前确定的 **"Issue 驱动"** 工作流，我认为 Case 详情页的 Dashboard 应该聚焦于四个维度：**健康度、阻塞点、时间流、协作效率**。

以下是针对 Case 详情页 Dashboard 的具体设计方案：

---

### 1. 核心看板：案件生命体征 (The Case Vitals)

_位置：详情页最顶部，作为常驻的 HUD (Heads-Up Display)_

这部分回答律师最本能的焦虑：**“这个案子现在安全吗？急不急？”**

- **综合健康分 (Health Score):**
- **设计：** 一个类似信用分或仪表盘的红/绿/黄指示器。
- **算法逻辑：** 结合了 `剩余时间` + `未解决的 Critical Issues 数量` + `客户响应延迟`。
- **价值：** 如果显示 **98 分 (绿色)**，律师可以放心略过；如果显示 **60 分 (红色)**，必须立刻处理。

- **谁持球 (Ball in Court):**
- **设计：** 一个简单的状态徽标。
- **内容：** `Waiting for Client` (高亮警告，已等待 3 天)

---

### 2. 核心图表：Issue 漏斗与雷达 (The Risk Radar)

_位置：主体区域上方或 Issue 列表侧边_

这部分直接服务于你的 **"Issue 驱动"** 理念，将散乱的问题数据化。

- **Issue 构成环形图 (Issue Composition):**
- **展示：** 将 Issue 分类统计。
- **Quality Check (QC):** 错别字、格式错误（低风险，助理处理）。
- **Compliance:** 薪资不达标、专业不对口（高风险，律师处理）。
- **Missing Info:** 缺文件（需客户处理）。

- **心智模型：** 律师一眼就能看出：“这个案子主要是材料乱七八糟（QC 多），还是硬伤很大（Compliance 多）？”

- **Issue 燃尽图 (Issue Burn-down Chart):**
- **展示：** 随着时间推移，Open Issues 的数量变化曲线。
- **价值：** 尤其是对于那种历时较长的案子（如 EB-1A），如果临近递交日期，曲线还是平的（问题没解决），这就是巨大的报警信号。

---

### 3. 协作透视：客户配合度 (Client Responsiveness)

_位置：右侧边栏或 Dashboard 次要区域_

在做个人业务时，**客户本身就是最大的不可控变量**。律师需要数据来管理客户预期，甚至作为后续免责的证据。

- **交互时间线 (Interaction Pulse):**
- **展示：** 律师发出 Request 到客户完成 Task 的平均耗时。
- **数据：** "该客户平均响应时间：**4.5 天** (慢于平均水平)"。
- **价值：** 提示律师需要更早地催促，或者使用更强硬的沟通策略。

- **任务完成率 (Task Completion Rate):**
- **展示：** 进度条。 `Documents Collected: 80%` / `Questions Answered: 100%`.
- **价值：** 直观展示瓶颈。如果卡在 80% 很久了，律师点击 Dashboard 直接跳转到那 20% 未完成的任务，一键催办。

---

### 4. 预测性数据：政府处理预估 (Government Prediction) - _针对移民场景的杀手级功能_

_位置：Dashboard 底部或时间轴附近_

这是利用全平台数据为单体 Case 提供的高级价值。

- **审批预测 (Approval Prediction):**
- **展示：** 基于当前处理中心（如 Texas Service Center）的实时数据。
- **内容：** “类似于此 Case 的当前平均审理周期为 3.5 个月。预计获批时间：**2025 年 10 月**。”
- **价值：** 极大地帮助律师回答客户最爱问的问题：“我还要等多久？”。律师截图这个 Dashboard 发给客户，既专业又有说服力。

---

### 总结：Dashboard 如何串联工作流？

我们可以设想这样一个律师的操作流：

1. **打开 Case 详情页：**

- **Dashboard 第一眼：** 看到 **健康分 75 (黄色)**，**倒计时 10 天**。律师立刻警觉。
- **扫视 Radar：** 发现有 **3 个 Critical Compliance Issues** 导致了分数的下降。
- **扫视 Client Pulse：** 发现客户平均响应很慢。

2. **决策与行动 (Action):**

- 律师意识到不能再等邮件往返了。
- 点击 Dashboard 上的 Compliance 红色区块，系统直接过滤出那 3 个核心 Issue。
- 律师快速处理（Review），利用系统生成 urgent notification 发送给客户。

3. **结果：**

- Dashboard 的可视性促使律师**优先处理**了这个有风险的案子，避免了 Deadline 事故。

**设计原则：** 不要为了做 Dashboard 而做 Dashboard。每一个图表都必须能**触发**律师的一个具体行动（去催客户、去改文件、或去递交）。

**Would you like me to describe the visual layout of this dashboard using a standard grid system (e.g., how to arrange these widgets on a screen)?**
