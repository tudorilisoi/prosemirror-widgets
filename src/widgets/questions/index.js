export {TextBox} from "./textbox"
export {ShortAnswer} from "./shortanswer"
export {Essay} from "./essay"
export {MultipleChoice, Choice} from "./multiplechoice"
export {CheckList, CheckItem} from "./checklist"
export {Scale, ScaleDisplay} from "./scale"
export {Selection} from "./selection"

import {defineInsertMenu} from "../../utils"

import {TextBox} from "./textbox"
import {ShortAnswer} from "./shortanswer"
import {Essay} from "./essay"
import {MultipleChoice} from "./multiplechoice"
import {CheckList} from "./checklist"
import {Scale} from "./scale"
import {Selection} from "./selection"

const menuName = "insertQuestionMenu"
defineInsertMenu(menuName, {label: "Insert question", defaultLabel: "Questions", rank: 50})

MultipleChoice.register(menuName, "main", {label: "MultipleChoice", command: "insert", rank: 84})
ShortAnswer.register(menuName, "main", {label: "Short Answer", command: "insert", rank: 85})
Essay.register(menuName, "main", {label: "Essay", command: "insert", rank: 86})
CheckList.register(menuName, "main", {label: "CheckList", command: "insert", rank: 87})
Scale.register(menuName, "main", {label: "Scale", command: "insert", rank: 88})
Selection.register(menuName, "main", {label: "Selection", command: "insert", rank: 89})
