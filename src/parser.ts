/* eslint-disable eqeqeq */
/* eslint-disable curly */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/semi */
import * as fs from 'fs'
/*
var IDENTIFIER: RegExp = /[a-zA-Z_]([a-zA-Z_] | [0-9])/
var inheritance: RegExp = /extends /
var program: RegExp = //
*/
export function lex(filePath: string)
{
    var str: string = filePath
    //console.log(fs.readFileSync(filePath).toString())
    if(fs.existsSync(filePath)) str = fs.readFileSync(filePath).toString()
    else return false
    //console.log(str)
    var cur = 0
    var tokens = []
    var line = 1
    var startPos = 1
    while(cur < str.length)
    {
        //console.log(tokens[tokens.length - 1])
        if(str[cur] == "#")
        {
            while(cur < str.length && str[cur] != "\n") cur++
        }
        else if(/[a-z]|_/i.test(str[cur]))
        {
            var word = str[cur++]
            while(cur < str.length && /[a-z]|[0-9]|_/i.test(str[cur])) word += str[cur++]
            if(KeyWord.includes(word))
            {
                tokens.push({
                    type: word,
                    value: word,
                    line: line,
                    startPos: startPos
                })
                startPos += word.length
            }
            else if(["true", "false"].includes(word))
            {
                tokens.push({
                    type: "Boolean",
                    value: word,
                    line: line,
                    startPos: startPos
                })
                startPos += word.length
            }
            else
            {
                tokens.push({
                    type: "Identifier",
                    value: word,
                    line: line,
                    startPos: startPos
                })
                startPos += word.length
            }
        }
        else if(Separators.includes(str[cur]))
        {
            tokens.push({
                type: "Separator",
                value: str[cur++],
                line: line,
                startPos: startPos
            })
            startPos++
        }
        else if(Operators.includes(str[cur]))
        {
            var operator = str[cur++]
            if([">", "<", "!", "="].includes(str[cur]))
            {
                if(str[cur] == "=") operator += str[cur++]
            }
            tokens.push({
                type: "Operator",
                value: operator,
                line: line,
                startPos: startPos
            })
            startPos += operator.length
        }
        else if(/[0-9]/.test(str[cur]))
        {
            var val = str[cur++]
            while(cur < str.length && /[0-9]/.test(str[cur])) val += str[cur++]
            tokens.push({
                type: "Number",
                value: val,
                line: line,
                startPos: startPos
            })
            startPos += val.length
        }
        else if(["\n", "\t", "\r"].includes(str[cur]))
        {
            tokens.push({
                type: "WhiteSpace",
                value: str[cur],
                line: line,
                startPos: startPos
            })
            if(str[cur] == "\n") 
            {
                line++
                startPos = 1
            }
            
            cur++
        }
        else if(str[cur] == " ")
        {
            cur++
            var len = 1
            while(cur < str.length && str[cur] == " ") 
            {
                len++
                cur++
            }
            
            tokens.push({
                type: "WhiteSpace",
                value: " *" + len,
                line: line,
                startPos: startPos
            })
            startPos += len
        }
        else if(["\"", "'"].includes(str[cur]))
        {
            var start = str[cur] 
            cur++
            startPos++
            var string: string = ""
            while(str[cur] != start && cur < str.length)
            {
                string += str[cur]
                cur++
                startPos++
            }
            if(str[cur] == start)
            {
                tokens.push({
                    type: "String",
                    value: `\"${string}\"`,
                    line: line,
                    startPos: startPos
                })
            }
            else return "字符串错误"
            cur++
        }
        else 
        {
            console.log("包含非法字符：" + str[cur] + " " + cur)
            cur++
        }
    }
    tokens.push({
        type: "EOF",
        value: str.length.toString(),
        line: line,
        startPos: startPos
    })
    return tokens
}

export function parser(filePath: string, conf?:{type?: string, tab?: number})
{
    var type, tab
    if(conf != undefined)
    {
        type = conf.type == undefined ? "json" : conf.type
        tab = conf.tab == undefined ? 1 : conf.tab
    }
    var tokens
    if(lex(filePath) && !(lex(filePath) instanceof String)) tokens = lex(filePath)
    else return false
    tokens = tokens as {type: string, value: string, line: number, startPos: number}[]
    var cur = 0
    var rootNode = {
        type: "Program",
        body: new Array(),
        startPos: 1,
        endPos: Number.parseInt(tokens[tokens.length - 1].value)
    }
    var errors: {line: number, startPos: number, value: string}[] = []
    while(cur < tokens.length)
    {
        switch(tokens[cur].type)
        {
            case "var":
                var result = VarState(cur, tokens, errors)
                rootNode.body.push(result.node)
                cur = result.cur
                errors = result.errors
                break
            case "const":
                var result = VarState(cur, tokens, errors)
                rootNode.body.push(result.node)
                cur = result.cur
                errors = result.errors
                break
            case "func":
                var func = FuncState(cur, tokens, errors)
                rootNode.body.push(func.func)
                cur = func.cur
                errors = func.errors
                break
            case "EOF":
                //console.log(rootNode)
                if(type == "json") return JSON.stringify(rootNode, undefined, 2)
                else if(type == "node") return rootNode
            case "WhiteSpace":
                cur++
                break
            default:
                cur++
                break
        }
    }
}

function ignoreSpace(cur: number, tokens: {type: string, value: string, line: number, startPos: number}[])
{
    if(/ \*[0-9]/.test(tokens[cur].value)) cur++
    return cur
}

const KeyWord = new Array<string>(
    "if", "pass", "else", "elif", "while", "for", "in", "match",
    "continue", "break", "return", "preload", "yield", "assert",
    "breakpoint", "var", "class", "class_name", "extends", "is",
    "as", "self", "tool", "signal", "func", "static", "onready",
    "const", "enum", "export", "setget", "remote", "INF", "TAU",
    "PI", "NAN", "master", "puppet", "remotesync", "mastersync",
    "puppetsync"
)
const Separators = new Array<string>(
    ",", ";", "(", ")", ":", "."
)
const Operators = new Array<string>(
    '+', '-', '*', '/', '=', '<', '>', '!', '>=', '<=', '!=', "=="
)

function getPreLen(cur: number, tokens: {type: string, value: string, line: number, startPos: number}[], tab?: number)
{
    var len = 0
    tab = tab == undefined ? 1 : 4
    for(var i = 0; i < cur; i++) 
    {
        if(/ \*[0-9]/.test(tokens[i].value)) 
        {
            len += Number.parseInt(tokens[i].value.split("*")[1])
            //console.log(tokens[i].value.split("*")[1])
            //console.log(tokens[i].value)
        }
        else if(tokens[i].value == "\t")
        {
            len += tab
        }
        else len += tokens[i].value.length
    }
    return len
}

function getPreTabs(cur: number, tokens: {type: string, value: string, line: number, startPos: number}[], tab: number = 4)
{
    if(cur == 0) return 0
    var tabs = 0
    while(tokens[cur].value != "\n") cur--
    cur++
    while(tokens[cur].value == "\t" || tokens[cur].value == " *" + tab) 
    {
        tabs++
        cur++
    }
    return tabs
}

function VarState(cur: number, tokens: {type: string, value: string, line: number, startPos: number}[], errors: {line: number, startPos: number, value: string}[])
:{cur: number, errors: {line: number, startPos: number, value: string}[], node: any}
{
    var len = getPreLen(cur, tokens)
    var node = {
        type: "VariableDeclaration",
        declarations: new Array(),
        startPos: len + 1,
        endPos: 0,
        kind: tokens[cur].value
    }
    var VariableDeclarator = {}
    var init = {}
    cur++
    cur = ignoreSpace(cur, tokens)
    if(tokens[cur].type == "Identifier")
    {
        VariableDeclarator = {
            type: "VariableDeclarator",
            id: {
                type: "Identifier",
                name: tokens[cur].value
            }
        }
        cur++
    }
    else
    {
        errors.push({
            line: tokens[cur].line,
            startPos: tokens[cur].startPos,
            value: "声明变量时未定义变量名"
        })
    }
    cur = ignoreSpace(cur, tokens)
    if(tokens[cur].value == "=")
    {
        cur++
        cur = ignoreSpace(cur, tokens)
        if(["Boolean", "Number", "String", "Identifier"].includes(tokens[cur].type))
        {
            init = {
                init: {
                    type: tokens[cur].type,
                    value: tokens[cur].value
                }
            }
        }
        else
        {
            errors.push({
                line: tokens[cur].line,
                startPos: tokens[cur].startPos,
                value: "初始化变量时赋值错误"
            })
        }
    }
    node.declarations.push({
        ...VariableDeclarator,
        ...init
    })
    node.endPos = getPreLen(cur, tokens) + tokens[cur].value.length
    cur++
    return {cur, errors, node}
}

function FuncState(cur: number, tokens: {type: string, value: string, line: number, startPos: number}[], errors: {line: number, startPos: number, value: string}[])
:{cur: number, errors: {line: number, startPos: number, value: string}[], func: any}
{
    var len = getPreLen(cur, tokens)
    var funcTabs = getPreTabs(cur, tokens)
    var node = {
        type: "FunctionDeclaration",
        params: new Array(),
        startPos: len + 1,
        endPos: 0
    }
    cur++
    cur = ignoreSpace(cur, tokens)
    var id = {}
    if(tokens[cur].type == "Identifier")
    {
        id = {
            id: {
                type: "Identifier",
                name: tokens[cur].value
            }
        }
    }
    else
    {
        errors.push({
            line: tokens[cur].line,
            startPos: tokens[cur].startPos,
            value: "声明函数时未定义函数名"
        })
    }
    cur++
    cur = ignoreSpace(cur, tokens)
    if(tokens[cur].value == "(")
    {
        cur++
        while(tokens[cur].value != ")")
        {
            var param = {
                type: "Identifier",
                name : tokens[cur].value
            }
            node.params.push(param)
            cur++
            cur = ignoreSpace(cur, tokens)
            if(tokens[cur].value == ",")
            {
                cur++
                cur = ignoreSpace(cur, tokens)
                if(tokens[cur].type != "Identifier")
                {
                    errors.push({
                        line: tokens[cur].line,
                        startPos: tokens[cur].startPos,
                        value: "函数的参数缺失"
                    })
                }
                else continue
            }
            else if(tokens[cur].value != ")")
            {
                errors.push({
                    line: tokens[cur].line,
                    startPos: tokens[cur].startPos,
                    value: "缺少符号 )"
                })
            }
        }
        cur++
        cur = ignoreSpace(cur, tokens)
        if(tokens[cur].value == ":")
        {
            cur++
            cur = ignoreSpace(cur, tokens)
        }
        else
        {
            errors.push({
                line: tokens[cur].line,
                startPos: tokens[cur].startPos,
                value: "缺少符号 :"
            }) 
        }
    }
    else 
    {
        errors.push({
            line: tokens[cur].line,
            startPos: tokens[cur].startPos,
            value: "缺少符号 ("
        })
    }
    if(tokens[cur++].value != "\n") 
    {
        errors.push({
            line: tokens[cur].line,
            startPos: tokens[cur].startPos,
            value: "方法的实现应在方法声明的下一行"
        })
    }
    var bodyStart = getPreLen(cur, tokens)
    var tab: number = 0
    if(tokens[cur].type != "WhiteSpace")
    {
        errors.push({
            line: tokens[cur].line,
            startPos: tokens[cur].startPos,
            value: "方法未实现"
        })
    }
    else if(tokens[cur + 1].type != "WhiteSpace")
    {
        if(tokens[cur].value == "\t") tab = 4
        else if(/ \*[0-9]/.test(tokens[cur].value)) tab = Number.parseInt(tokens[cur].value.split("*")[1])
        else if(tokens[cur].value == "\n")
        {
            errors.push({
                line: tokens[cur].line,
                startPos: tokens[cur].startPos,
                value: "方法未实现"
            })
        }
    }
    var body = new Array()
    while((tokens[cur].value == "\t" || / \*[0-9]/.test(tokens[cur].value) || getPreTabs(cur, tokens, tab) > funcTabs && cur < tokens.length)) 
    {
        //console.log(tokens[cur])
        switch(tokens[cur].type)
        {
            case "var":
                var result = VarState(cur, tokens, errors)
                console.log(result.node)
                body.push(result.node)
                cur = result.cur
                errors = result.errors
                break
            case "Identifier":
                break
            default:
                break
        }
        cur++
    }
    var func = {
        ...node,
        ...id,
        body: {
            value: body,
            startPos: bodyStart,
            endPos: getPreLen(cur, tokens) + tokens[cur].value.length
        }
    }
    func.endPos = getPreLen(cur, tokens) + tokens[cur].value.length
    return {cur, errors, func}
}

export function isInFunc(index: number, rootNode: {type: string, body: any[], startPos: number, endPos: number})
{
    var node = rootNode
    for(var i of rootNode.body)
    {
        var item = i as {type: string}        
        console.log(item)
        if(i.type == "FunctionDeclaration")
        {
            var func = i as {body: {startPos: number, endPos: number}, id: {type: string, name: string}}
            if(index >= func.body.startPos && index <= func.body.endPos) return {bol: true, name: func.id.name}
        }
    }
    return false
}