"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.charaData = exports.attCoeData = exports.signalData = exports.register = void 0;
/* eslint-disable curly */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/semi */
const vscode = require("vscode");
const parser = require("./parser");
function register(context) {
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('gdscript', {
        provideCompletionItems(document, position, token, context) {
            var line = document.lineAt(position);
            console.log(document.offsetAt(position));
            var lineText = line.text
                .replace(/\t/g, "")
                .replace(/ /g, "")
                .substring(0, position.character);
            var list = [];
            var a = parser.parser(document.uri.fsPath, {
                type: "node",
                tab: 4
            });
            console.log(a);
            if (document.getText().includes("extends Chara") || document.fileName[0] == "c") {
                for (let nameE in exports.charaData) {
                    if (ld(lineText, nameE) <= nameE.length) {
                        var CI = new vscode.CompletionItem(nameE, vscode.CompletionItemKind.Field);
                        CI.detail = exports.charaData[nameE];
                        list.push(CI);
                    }
                }
                if (/func/g.test(lineText)) {
                    for (let nameE in exports.signalData) {
                        if (ld(lineText, nameE) <= nameE.length) {
                            var CI = new vscode.CompletionItem(nameE, vscode.CompletionItemKind.Function);
                            CI.detail = exports.signalData[nameE];
                            var args = exports.signalData[nameE].split("   ")[1].split(":")[0];
                            CI.insertText = `${nameE}(${args}):\n\t.${nameE}(${args})\n\t`;
                            list.push(CI);
                        }
                    }
                }
            }
            if (/attCoe\./g.test(lineText)) {
                for (let nameE in exports.attCoeData) {
                    var CI = new vscode.CompletionItem(nameE, vscode.CompletionItemKind.Field);
                    CI.detail = exports.attCoeData[nameE];
                    list.push(CI);
                }
                list.push(new vscode.CompletionItem("atkRan", vscode.CompletionItemKind.Field));
            }
            return list;
        }
    }, '.'));
    context.subscriptions.push(vscode.languages.registerHoverProvider("gdscript", {
        provideHover: (doc, pos) => {
            const word = doc.getText(doc.getWordRangeAtPosition(pos));
            let hoverText = GetStringFromDic(word);
            return new vscode.Hover(hoverText);
        }
    }));
}
exports.register = register;
exports.signalData = {
    "_onHurt": "角色受伤时   aktInfo:伤害信息",
    "_onHurtEnd": "角色受伤后   aktInfo:伤害信息",
    "_onPlusHp": "恢复生命时   val:恢复值",
    "_onKillChara": "击杀其他单位时   aktInfo:伤害信息",
    "_onDeath": "死亡时   aktInfo:伤害信息",
    "_onAtkChara": "造成伤害时   atkInfo:伤害信息",
    "_onChangeTeam": "改变队伍时   team:队伍编号",
    "_onPressed": "角色被点击时   cha:点击的角色",
    "_onAddItem": "添加道具时   item:添加的道具",
    "_onDelItem": "删除道具时   item:删除的道具",
    "_onCastCdSkill": "施放技能时   id:技能编号",
    "_onAddBuff": "添加buff时   buff:添加的buff",
    "_onCharaDel": "被删除时   cha:被删除的角色",
    "_onNewChara": "召唤生物时   cha:被召唤角色"
};
exports.attCoeData = {
    "hp": "生命",
    "cri": "暴击率",
    "maxHp": "最大生命",
    "suck": "吸血",
    "atk": "物理攻击",
    "mgiSuck": "魔法吸血",
    "def": "物理防御",
    "reHp": "受治疗效果百分比",
    "atkRan": "攻击距离",
    "spd": "攻击速度",
    "mgiAtk": "魔法攻击",
    "cd": "技能冷却",
    "mgiDef": "魔法防御",
    "dod": "闪避率",
    "pen": "护甲穿透",
    "maxHpL": "最大生命百分比",
    "mgiPen": "魔法穿透",
    "atkL": "物理攻击百分比",
    "defL": "物理防御百分比",
    "mgiDefL": "魔法防御百分比",
    "penL": "物理穿透百分比",
    "mgiPenL": "魔法穿透百分比",
    "criR": "暴击伤害加成",
    "mgiSuckL": "魔法吸血百分比",
    "defR": "承受伤害减少"
};
exports.charaData = {
    "id": "角色标识",
    "chaName": "角色名称",
    "cell": "角色在棋盘中的位置",
    "position": "角色在画面上的位置",
    "moveSpeed": "角色的移动速度，默认300，既每秒移动3格(一格100)",
    "aiOn": "是否开启ai自动攻击",
    "aiCha": "当前的仇恨目标",
    "att": "角色呈现的最终属性",
    "attInfo": "临时属性（会在上下场时清空）",
    "attCoe": "角色的基础属性点",
    "attAdd": "角色的附加属性值",
    "buffs": "角色身上拥有的buff列表",
    "items": "装备列表",
    "isMoveIng": "角色是否在移动中",
    "isDeath": "角色是否已死亡",
    "isSumm": "角色是否召唤生物",
    "skillStrs": "技能描述文本列表",
    "atkEff": "攻击时的特效名字",
    "lv": "角色等级",
    "skills": "cd技能列表",
    "HurtType": "伤害类型PHY/MGI/REAL 代表物理/魔法/真实",
    "AtkType": "攻击类型NORMAL/SKILL/EFF/MISS 代表正常/技能/特效/落空",
    "atkIng": "判断是否在攻击，只读",
    "sprcPos": "数值和特效的出现点，默认角色图片中心",
    "normalSpr": "角色图片的偏移",
    "isDrag": "角色是否可拖拽",
    "dire": "角色当前的左右面向",
    "evos": "角色的进化分支列表"
};
function ld(source, target) {
    var sl = source.length;
    var tl = target.length;
    var matrix = [];
    //初始化
    for (var k = 0; k <= sl; k++) {
        matrix.push([]);
        matrix[k][0] = k;
    }
    for (var k = 0; k <= tl; k++)
        matrix[0][k] = k;
    var cost = 0;
    for (var i = 1; i <= sl; i++) {
        for (var j = 1; j <= tl; j++) {
            if (source.charAt(i - 1) == target.charAt(j - 1))
                cost = 0;
            else
                cost = 1;
            matrix[i][j] = Math.min(matrix[i - 1][j - 1] + cost, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
        }
    }
    return matrix[sl][tl];
}
function GetStringFromDic(key) {
    var value = (exports.attCoeData[key] + exports.charaData[key]).replace(/undefined/g, "");
    return value;
}
//# sourceMappingURL=godot.js.map