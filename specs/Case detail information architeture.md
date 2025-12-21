
# Case detail information architeture
## **1. 核心布局策略：三段式渐进披露 (Progressive Disclosure)**

为了降低摩擦，页面应根据当前状态自动切换其“重心”。

### **A. 头部：状态与时效区 (Status & Urgency)**

* **状态导航条（Status Ribbon）：** 视觉呈现 `Intake` -> `Validation` -> `Ready` -> `Submitted` 的线性进度。
* **关键元数据：** 申请人姓名、签证类型、当前状态的持续时长（例如：已处于 `Conflict Flagged` 3 天，暗示催办必要性）。
* **全局主操作按钮：** 按钮文案随状态变化（如：`Send Request to Applicant` 或 `Launch Form Pilot`）。

---

## **2. 状态驱动的内容组织 (State-Specific Architecture)**

详情页的中间核心区应根据状态机的流转，呈现完全不同的信息视图：

### **第一阶段：处于 Document Intake 时 (关注“物”)**

此时律师最关注的是“材料齐了没”和“清晰吗”。

* **智能 Checklist 面板：**
* 按预设分类展示文档列表。
* **Issue 深度集成：** 如果处于 `Quality Issue`，错误提示直接挂在具体文档下方（如：“护照扫描件：缺页”），并提供“一键开启重传请求”入口。


* **Intake 工具集：** 侧边栏提供“PDF 合并”与“智能压缩”快捷键，处理完后状态即刻向 `QualityControl` 流转。

### **第二阶段：处于 Compliance Review 时 (关注“理”)**

此时物理材料已通关，律师精力应集中在“逻辑冲突”上。

* **冲突决策中心 (Conflict Resolution Center)：**
* 不再显示完整文档清单，而是置顶显示 **`Conflict Flagged` 列表**。
* **对比视图：** 点击一个冲突项（如：婚姻日期冲突），UI 自动打开“分屏比对”——左侧是提取出的结构化数据，右侧是证明文件（如结婚证）的原文高亮截图。
* **决策动作：** 每个冲突项提供 `Override (律师确认无误)` 或 `Request Clarification (要求客户解释)`。



### **第三阶段：处于 Ready to Submit 时 (关注“信”)**

此时逻辑已闭环，目标是建立最后的“提交信心”。

* **Schema 预览墙：** 以高度结构化的表格展示最终填表数据。所有数据带上“已校验”的绿色标记。
* **数据锁定状态：** UI 变为只读模式，防止意外修改，确保提交的一致性。
* **一键填表入口：** 明显的执行区，提示律师开启浏览器插件。

---

## **3. 降低摩擦的三个关键交互设计**

### **A. 上下文临近原则 (Contextual Proximity)**

**痛点：** 律师在发现 `Conflict Flagged` 时，最烦去文件夹里重新翻找原始 PDF 确认。
**设计：** 所有的 Issue 必须是“可下钻”的。点击 Issue 立即在同一页面侧滑出对应的 PDF 页面，**实现“证据与结论”在同一视域内共存。**

### **B. 责任主体明确化 (Clear Accountability)**

**设计：** 清楚标注谁在卡流程。

* 如果是 `Quality Issue`，显示“等待申请人重传”。
* 如果是 `Conflict Flagged`，显示“等待律师判定”。
这种架构能消除律师的焦虑感——“现在该我动，还是该客户动？”

### **C. 自动汇总 Issue 报告 (Automated Summary)**

**设计：** 在详情页顶端永远有一个 Issue Counter（例如：`2 Quality Issues / 1 Logic Conflict`）。点击数字，页面自动滚动（Auto-scroll）并聚焦到该问题区，减少无意义的页面滚动。

---

## **4. 信息架构图 (IA Map)**

| 模块层级 | 处于 Intake 阶段 | 处于 Compliance 阶段 | 处于 Ready/Submitted |
| --- | --- | --- | --- |
| **视图重心** | **文档清单 (Checklist)** | ** Issue 列表 (Audit Log)** | **数据预览 (Final Schema)** |
| **核心动作** | 合并文档、催办材料 | 冲突判定、修正数据 | 执行 Form Pilot |
| **关键信息** | 缺失项、模糊项 | 语义冲突、业务规则预警 | 提交日期、官网回执编号 |

---

## **总结：好产品的“直觉性”**

一个好的 Xeni 2.0 Case 详情页，应该是**“让数据来找律师”**，而不是律师去找数据。通过将 `Intake` 和 `Validation` 分阶段处理，我们帮助律师实现了“认知卸载”——第一阶段只看文件的物理属性，第二阶段才看法律逻辑。