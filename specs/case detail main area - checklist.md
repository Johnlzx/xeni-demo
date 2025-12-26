# case detail main area - checklist

现在来对case 详情的主工作区进行优化，优化的范围包含当前的 Dashboard和 issuelist。

首先需要增加一个 checklis作为整个 case 的大纲。如何理解大纲？checklist 根据当前的签证类型，相关的业务知识和用户事实上传的文件动态生成并调整。checklist 可以作为整个 case 信息分类规整的第一级维度，所有的文档都可以归类到 checklist 中，所有的 issue 又和文档相关联。它本质上是一个 section 分类，每一个 section 之下有这个 section 中具体的文件，以及和文件关联的 issue ，所有 case 的信息向上归集都可以分类到 checklist 中。基于这一点思考，我想将 checklist 作为 case 详情页主工作区的导航目录。这个导航目录是纵向排布的，建议位置在页面的左侧。

checklist 导航之外的区域就是每一个 checklist section 的内容，聚焦在这个section 之下的 issues，归集当前版本的 issue 卡片。除了 issue 之外，也需要有一个次要一级的组件来展示当前section之下已经上传的文件和没有上传的文件，点击对应的 ui 可以对文件进行预览 - 也就是现在的已经实现的 pdf 预览模态窗。

对于尚未上传任何文件的 checklist，主体可以展示request client 的组件，chase 用户，配合当前的 section 说明。

对于 case 创建伊始，没有任何内容的时候，checklist 依然存在，但是主要区域应该是一个引导用户上传的组件。

注意 checklist 中的每一个section 都应该有自己的状态，包括当前的 issue 数量和已上传/未上传的文件。可以有一个精致的圆环来显示完成度。同时 section 和 section 之间也由区别，有的是必要 section，有的是可选的，有的是根据用户的信息推断出必要的（例如中国申请者需要上传无肺结核的相关证明）。

现在再回头看已有的 Dashboard，因为它的定位已经可以被 checklist 取代，我们只需要在 checklist 导航的顶部增加一些指标（侧重issue 统计追踪和文档数量统计），就可以把现有的 Dashboard 拿掉，这样提高了页面空间的效率。