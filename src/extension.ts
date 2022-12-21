/* eslint-disable @typescript-eslint/semi */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import * as godot from './godot'
import * as parser from './parser'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "lcmodhelper" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('lcmodhelper.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from LCModHelper!');
	});
	godot.register(context)
	var code = `var ab = 12\nfunc _onBattleStart():\n\t._onBattleStart()\n\tatknum = 0\n`
	var testCode = 
`extends Chara
func _init(): 
    pass
func _extInit():
    ._extInit()
    id = "cMantoRock"
    chaName = "石头"
    attCoe.atkRan = 1
    attCoe.atk = 2
    attCoe.mgiAtk = 2;
    attCoe.def = 2
    attCoe.mgiDef = 2;
    attCoe.maxHp
    lv = 1
    att
    atkEff = "atk_dao"
    addSkillTxt("每3次攻击后，下次攻击将会恢复10点生命并为对手施加一层流血")

func _onAddItem(item):
    ._onAddItem(item)
    
var atknum = 0
func _onAtkChara(atkInfo):
    ._onAtkChara(atkInfo)
    if atkInfo.atkType == Chara.AtkType.NORMAL:
        atknum += 1
        if atknum > 3:
            atknum = 0
            plusHp(10)
            atkInfo.hitCha.addBuff(b_liuXue.new(1))


func _onBattleStart():
	._onBattleStart()
`
	/*
	console.log(parser.parser(testCode,{
		type: "json"
	}))
	var node = parser.parser(testCode, {
		type: "node"
	}) as {type: string, body: any[], startPos: number, endPos: number}
	console.log(parser.isInFunc(34 ,node))
	*/
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
