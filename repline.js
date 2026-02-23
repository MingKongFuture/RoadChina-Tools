/*
本脚本是基于UP主「基岩下的活塞臂」的迷上城建曲线标线替换脚本开发
所以部分function名字我直接照抄了，跟着思路然后修改了亿堆bug
作：明空·未来
适用于：Minecraft Forge 1.12.2, 1.16.5~1.20.1 道路中国模组

R.I.P.
此致 Epochwood
*/
importPackage(Packages.com.sk89q.worldedit);
importPackage(Packages.com.sk89q.worldedit.math);
importPackage(Packages.com.sk89q.worldedit.blocks);

var pair = 0;            //确保两个斜线方块被视为一个方块处理
var offset_dir;          //S形线段方向（左/右）
var offset_sta = false;  //S形线段方向已记录

var dotted_counter = 0;  //1、2、3沥青；4、5、6标线
var dotted_sta = false;  //未启用虚线功能


var blocks = context.remember();
var player = context.getPlayer();
var loc = player.getLocation();
var dir = loc.getDirection();

var dx = dir.getX();
var dz = dir.getZ();

var facing;

if (Math.abs(dx) > Math.abs(dz)) {
    facing = dx > 0 ? "east" : "west";
} else {
    facing = dz > 0 ? "south" : "north";
}
if (argv[1] == undefined) {
    player.printError("请输入参数，/cs repline [颜色(w/y/dw/dy/wd/yd/dwd/dyd)]")
} else if (argv[1] == "w" || argv[1] == "y" || argv[1] == "dw" || argv[1] == "dy" || argv[1] == "wd" || argv[1] == "yd" || argv[1] == "dwd" || argv[1] == "dyd") {
    if (argv[1] == "dy" || argv[1] == "wd" || argv[1] == "yd" || argv[1] == "dwd" || argv[1] == "dyd"){
        dotted_sta = true;
    }
    function isLineEndPoint(pos) {
        var block = blocks.getBlock(pos);
        if (!block) return false;
        var blockName = String(block).split("[")[0];

        // 检查所有方向（包括上下）
        var directions = [
            BlockVector3.at(1, 0, 0), BlockVector3.at(-1, 0, 0), // 东西
            BlockVector3.at(0, 0, 1), BlockVector3.at(0, 0, -1), // 南北
            BlockVector3.at(0, 1, 0), BlockVector3.at(0, -1, 0), // 上下
            // 斜向方向
            BlockVector3.at(1, 1, 0), BlockVector3.at(-1, 1, 0),
            BlockVector3.at(0, 1, 1), BlockVector3.at(0, 1, -1),
            BlockVector3.at(1, -1, 0), BlockVector3.at(-1, -1, 0),
            BlockVector3.at(0, -1, 1), BlockVector3.at(0, -1, -1)
        ];

        var adjacentCount = 0;

        for (var i = 0; i < directions.length; i++) {
            var adjPos = pos.add(directions[i]);
            var adjBlock = blocks.getBlock(adjPos);
            if (adjBlock && String(adjBlock).split("[")[0] === blockName) {
                adjacentCount++;
            }
        }

        return adjacentCount <= 1;
    }

    function lineDirectionWithCorners(origin, distance) {
        var block = blocks.getBlock(origin);
        var line_block_type = String(block).split("[")[0];
        var lines = [];
        var lines_string = [];

        // 检查方块是否存在（包括上下层）
        var is_online = function (o, dir) {
            var pos = o.add(dir);
            if (lines_string.indexOf(String(pos)) != -1) return false;
            var block = blocks.getBlock(pos);
            if (!block) return false;
            var blockName = String(block).split("[")[0];
            if (blockName === "minecraft:air") return false;
            return blockName == line_block_type;
        }

        // 初始方向检测（包括上下层）
        var dir = BlockVector3.at(1, 0, 0);
        if (String(blocks.getBlock(origin.subtract(dir))).split("[")[0] == line_block_type) {
            dir = BlockVector3.at(-1, 0, 0);
        }

        var dx = dir.getX(), dz = dir.getZ();
        var up = BlockVector3.at(0, 1, 0);
        var down = BlockVector3.at(0, -1, 0);

        for (var i = 0; i < distance; i++) {
            // 检查是否转弯
            var cornerType = "";
            var left = BlockVector3.at(dz, 0, -dx);
            var right = BlockVector3.at(-dz, 0, dx);
            var straight = BlockVector3.at(dx, 0, dz);

            // 检查左右连接（包括上下层）
            var leftConnected = is_online(origin, left) || is_online(origin, left.add(up)) || is_online(origin, left.add(down));
            var rightConnected = is_online(origin, right) || is_online(origin, right.add(up)) || is_online(origin, right.add(down));

            if (leftConnected && !rightConnected) {
                cornerType = "left";
            } else if (!leftConnected && rightConnected) {
                cornerType = "right";
            }
            
            
            if (!offset_sta && i > 1){
                offset_dir = cornerType == "left" ? "l" : "r";
                offset_sta = true;
            }

            lines.push({ pos: origin, facing: facing, cornerType: cornerType, offset_dir: offset_dir });
            lines_string.push(String(origin));

            // 寻找下一个方块（优先检查直行方向，然后左右，包括上下层）
            var nextDir = null;
            var foundNext = false;

            // 检查直行方向（包括上下层）
            if (is_online(origin, straight.add(up))) {
                offset_sta = false;
                nextDir = straight.add(up);
                foundNext = true;
            } else if (is_online(origin, straight)) {
                nextDir = straight;
                foundNext = true;
                offset_sta = false;
            } else if (is_online(origin, straight.add(down))) {
                nextDir = straight.add(down);
                foundNext = true;
                offset_sta = false;
            }

            // 检查左右方向（包括上下层）
            if (!foundNext) {
                if (cornerType === "left") {
                    if (is_online(origin, left.add(up))) {
                        nextDir = left.add(up);
                    } else if (is_online(origin, left)) {
                        nextDir = left;
                    } else if (is_online(origin, left.add(down))) {
                        nextDir = left.add(down);
                    }
                } else if (cornerType === "right") {
                    if (is_online(origin, right.add(up))) {
                        nextDir = right.add(up);
                    } else if (is_online(origin, right)) {
                        nextDir = right;
                    } else if (is_online(origin, right.add(down))) {
                        nextDir = right.add(down);
                    }
                }
            }

            // 如果没有找到下一个方块，结束循环
            if (!nextDir) break;

            dx = nextDir.getX();
            dz = nextDir.getZ();
            origin = origin.add(nextDir);
        }

        return lines;
    }

    function replaceFacingBlocks(origin, distance) {
        // 根据参数设置方块类型
        
        if (argv[1] == "w" || argv[1] == "wd") { //单白线
            var straightBlock = "roadchina:white_line_1";
            var cornerBlock = "roadchina:white_line_2";
        } else if (argv[1] == "y" || argv[1] == "yd") { //单黄线
            var straightBlock = "roadchina:yellow_line_1";
            var cornerBlock = "roadchina:yellow_line_2";
        } else if (argv[1] == "dw" || argv[1] == "dwd") { //双白线
            var straightBlock = "roadchina:white_line_7";
            var cornerBlock = "roadchina:white_line_8";
        } else if (argv[1] == "dy" || argv[1] == "dyd") { //双黄线
            var straightBlock = "roadchina:yellow_line_3";
            var cornerBlock = "roadchina:yellow_line_4";
        }

        var lines = lineDirectionWithCorners(origin, distance);
        var replacedCount = 0;
        
        for (var i = 0; i < lines.length; i++) {
            var info = lines[i];
            var pos = info.pos;
            var facing = info.facing;
            var cornerType = info.cornerType;
            var offset_dir = info.offset_dir;
            if (i > 1){
                previous_curve = i > 0 ? lines[i - 1].cornerType : "";
                if (previous_curve == "right" && pair == 1 && cornerType == ""){
                    //player.print("顺时针")
                    offset_sta = false;
                    const nextDir_C = {
                        north: "east",
                        east: "south",
                        south: "west",
                        west: "north"
                    };
                    for (var j = i; j < lines.length; j++) {
                        lines[j].facing = nextDir_C[lines[j].facing];
                    }
                    facing = nextDir_C[facing] || "north";
                    offset_sta = false;
                } else if (previous_curve == "left" && pair == 1 && cornerType == ""){
                    //player.print("逆时针")
                    const nextDir_AC = {
                        north: "west",
                        west: "south",
                        south: "east",
                        east: "north"
                    };
                    for (var j = i; j < lines.length; j++) {
                        lines[j].facing = nextDir_AC[lines[j].facing];
                    }
                    facing = nextDir_AC[facing] || "north";
                    offset_sta = false;
                }
            }

            if (!offset_sta && i > 1){
                offset_dir = cornerType == "left" ? "l" : "r";
                offset_sta = true;
            }

            // 根据是否转弯选择方块类型
            var blockType = cornerType ? cornerBlock : straightBlock;
            var newBlockStr = blockType + "[facing=" + facing + "]";
            
            // 特殊处理：对于弯道中的斜线方块，调整facing方向
            if (cornerType && (cornerBlock !== straightBlock)) {
                if (pair == 0){
                    pair = 1;
                } else if (pair == 1){
                    pair = 2;
                } else if (pair == 2){
                    pair = 1;
                }
                //player.print("当前为第" + pair + "个斜线方块，往" + cornerType + "侧，指针方向：" + facing + "，指针整体方向：" + offset_dir)
                if (cornerType === "left"){
                    if ((facing == "east" && offset_dir == "l") || (facing == "north" && offset_dir == "r"))
                        newBlockStr = cornerBlock + "[facing=west]";
                    if ((facing == "east" && offset_dir == "r") || (facing == "south" && offset_dir == "l"))
                        newBlockStr = cornerBlock + "[facing=north]";
                    if ((facing == "south" && offset_dir == "r") || (facing == "west" && offset_dir == "l"))
                        newBlockStr = cornerBlock + "[facing=east]";
                    if ((facing == "west" && offset_dir == "r") || (facing == "north" && offset_dir == "l"))
                        newBlockStr = cornerBlock + "[facing=south]";
                } else if (cornerType === "right"){
                    if ((facing == "east" && offset_dir == "l") || (facing == "north" && offset_dir == "r"))
                        newBlockStr = cornerBlock + "[facing=east]";
                    if ((facing == "east" && offset_dir == "r") || (facing == "south" && offset_dir == "l"))
                        newBlockStr = cornerBlock + "[facing=south]";
                    if ((facing == "south" && offset_dir == "r") || (facing == "west" && offset_dir == "l"))
                        newBlockStr = cornerBlock + "[facing=west]";
                    if ((facing == "west" && offset_dir == "r") || (facing == "north" && offset_dir == "l"))
                        newBlockStr = cornerBlock + "[facing=north]";
                }


            } else {
                pair = 0;
                // player.print("当前count " + dotted_counter + "；遇到直线");
            }

            //虚线
            if (dotted_sta){

                if (cornerType){
                    if (pair == 1){
                        dotted_counter++;
                    }
                } else {
                    dotted_counter++;
                }

                if (dotted_counter > 6) dotted_counter = 1;

                if (dotted_counter <= 3){
                    newBlockStr = "roadchina:asphalt_road";
                }
            }

            //player.print(facing)
            var newBlock = context.getBlock(newBlockStr);
            if (newBlock) {
                blocks.setBlock(pos, newBlock);
                replacedCount++;
            } else {
                player.print("无法找到方块: " + newBlockStr);
            }
        }

        player.print("已替换方块数量: " + replacedCount);
    }


    var startPos = player.getBlockOn().toVector().toBlockPoint();

    if (isLineEndPoint(startPos)) {
        replaceFacingBlocks(startPos, 10000);
    } else {
        player.printError("这不是线的端点，请勿同时在方块的不同方向堆叠方块");
    }
} else {
    player.printError("参数错误：" + argv[1]);
    player.printError("标线仅支持：单白实线w 单黄实线y 双白实线dw 双黄实线dy 单白虚线wd 单黄虚线yd 双白虚线dwd 双黄虚线dyd");
}

