export {Input} from "./input"
export {TextBox} from "./textbox"
export {CheckBox} from "./checkbox"
export {RadioButton} from "./radiobutton"
export {ShortAnswer} from "./shortanswer"
export {Essay} from "./essay"
export {Select} from "./select"
export {ChoiceList, Choice} from "./choicelist"
export {CheckList, CheckItem} from "./checklist"
export {Scale} from "./scale"

import {defineInsertMenu} from "../../utils"

import {Input} from "./input"
import {TextBox} from "./textbox"
import {CheckBox} from "./checkbox"
import {RadioButton} from "./radiobutton"
import {ShortAnswer} from "./shortanswer"
import {Essay} from "./essay"
import {Select} from "./select"
import {ChoiceList, Choice} from "./choicelist"
import {CheckList, CheckItem} from "./checklist"
import {Scale} from "./scale"

const menuName = "insertAnswerMenu"
defineInsertMenu(menuName, {label: "Insert answer elements", defaultLabel: "Answers", rank: 50})

ShortAnswer.register(menuName, "main", {label: "Short Answer", command: "insert", rank: 85})
Essay.register(menuName, "main", {label: "Essay", command: "insert", rank: 86})
ChoiceList.register(menuName, "main", {label: "Choice List", command: "insert", rank: 70})
CheckList.register(menuName, "main", {label: "Check List", command: "insert", rank: 88})
Scale.register(menuName, "main", {label: "Scale", command: "insert", rank: 89})
Select.register(menuName, "main", {label: "Select Dropdown", command: "insert", rank: 90})
CheckBox.register(menuName, "main", {label: "Check Box", command: "insert", rank: 91})
