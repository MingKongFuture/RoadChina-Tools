## 前言:

本插件基于[SunBedrock的Mishanguc-Tools](https://github.com/SunBedrock/Mishanguc-Tools)改写而成。

由于迷上城建只支持Fabric，本插件适配[Epochwood的道路中国](https://github.com/Epochwood/RoadChina)模组，这是一个基于Forge的道路标线模组。

R.I.P. Epochwood

本插件基于 WorldEdit 里的 CraftScript 编写的脚本文件，如需使用此脚本：

1. 安装[WorldEdit](https://www.curseforge.com/minecraft/mc-mods/worldedit)
2. 安装[Rhino JS引擎](https://www.curseforge.com/minecraft/mc-mods/rhino)，将其改名为 `js.jar`
3. 将下载的 `js` 文件放入 `config\worldedit\craftscripts` 文件夹里

## repline.js

可以将相连的直线线段或曲线替换为道路中国标线类型的方块，使用 `/cs repline <类型>` 将脚下相连的线段替换成道路中国的标线。
**即使曲线扭成麻花本脚本依然能够使用**

`<类型>`：

单白实线`w` 单黄实线`y` 双白实线`dw` 双黄实线`dy`； 单白虚线`wd` 单黄虚线`yd` 双白虚线`dwd` 双黄虚线`dyd`


## repslab.js

可以将选区最高一层的道路中国道路整砖替换成半砖，可以将最高一层的下半砖下移半格替换成双半砖（可选）。

【该部分除道路中国模组适配性外其余代码均由[SunBedrock](https://github.com/SunBedrock)完成】

`/cs repslab` 或 `/cs repslab -r`（只替换道路方块）
