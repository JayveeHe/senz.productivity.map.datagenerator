# 地图模拟数据工具说明ver 1.0

---
目前本工具的用途是生成可供实际标注模型使用的输入数据，数据的格式应与实际采集到的数据一致，使用这些模拟数据对模型进行训练，并用所得模型对实际采集到的数据进行标注分类，看看效果。
关于原始sensor数据、sound数据的模拟，暂时无法做到。

##基本使用方法
当前的地图工具只能够生成路径模拟的数据，见http://maptools.avosapps.com/。
使用的情景如下：
1. 在右边选择一个context，例如go_work。此处的context选项是读取senz.config中的event_types内容
2. 在上方点击起点、终点、途经点等按钮，并在地图中点击，可以设定相应的点，同时这些点是可以拖拽的。
3. 点击驾车导航或步行导航分别得到路线，之后点获取数据，将所生成路线上的gps数据post到服务器上，进行相应的处理后返回给web端显示。
4. 点击地图上表示出的每个点可以查看当前点的信息（context、poi、gps坐标等，poi当前显示的是附近的pois）
###缺点
这个方法生成的gps数据量与路径长度相关，因此有一个很大的缺陷，即：无法模拟出用户的某些静态context，例如work_in_office之类的情景。这些情景有一个很大的特点——gps坐标分布很集中，poi的指示作用相较于路径途中的poi更大，并且判定时也更依赖于motion和sound

##数据的使用
地图工具最基本的功能就是生成相应的、具有一定真实意义的GPS坐标序列，并发送给后端。我们的数据模拟重点放在后端。
###location项的生成
后端根据gps的lat、lng，调用相应接口获得pois信息，按照距离远近排序并取最近的k项，根据一定的规则（加权？或者直接选最近的？）决定该点的location信息。
###motion、sound项的生成
这一块需要很大的人工先验，相应的context下会有一定的期望motion，比如work_in_office就有很大概率是处于sitting或者walking的；sound项同理，在此使用senz.config中的event_prob_map数据。
###day、time项
这两项可以使用先验条件随机生成（有个概率映射），或者在网页端直接设置。


###增加点击模式
需增加一个功能，在地图上点击一个位置，获取该位置的坐标、poi，再根据当前设置的context生成相应的motion与sound。

##2015.7.26更新
1. 增加了点击模式
2. 手动设置情景、时间、day；相应的sound、motion等feature的自动生成
3. 点击获取数据之前勾选“保存数据”的话，会将所生成的数据保存到leancloud中的senz.productivity.map.datagenerator的GeneratedData表中