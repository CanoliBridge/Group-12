# Propositinal_solver.py
# Author: Mathias Buchanan
# Solves: 1.2 propositinal logic problems

import json

letters = []
outputString = ""
outputStrng = ""
printedH = []
HsPrinted = 0
hypothesi = []

def replaceNot(inputString):
    instr = ""
    donext = True
    for i, e in enumerate(inputString):
        if e == "¬":
            donext = False
            instr += inputString[i + 1] + "'"
        elif donext:
            instr += e
        else:
            donext = True
    
    return instr

def fixString(inputString):
    instr = inputString.replace(" ", "")
    instr = replaceNot(instr)
    instr = instr.replace("->", ">")
    instr = instr.replace("→", ">")
    instr = instr.replace("′", "'")
    instr = instr.replace("`", "^")
    instr = instr.replace("∧", "^")
    instr = instr.replace("~", "v")
    instr = instr.replace("V", "v")
    instr = instr.replace("S", ">")
    instr = instr.replace("[", "(")
    return instr.replace("]", ")")


class Letter:
    def __init__(self, letter, parent1, parent2, typeOfGetThere, is_Not, istrue):
        self.letter = letter
        self.is_Not = is_Not
        self.istrue = istrue
        self.parent1 = parent1
        self.parent2 = parent2
        self.type = typeOfGetThere
        self.pnumb = 0
    
    def __eq__(self, value):
        # Check if the value is a Letter object or a string
        if isinstance(value, Letter):
            return self.letter == value.letter
        return self.letter == value  # Compare with string if value is not a Letter
    
    # Override the >= operator
    def __ge__(self, value):
        # Check if the value is a Letter object or a string
        if isinstance(value, Letter):
            return self.letter == value.letter and self.is_Not == value.is_Not
        return False  # If string, compare letter only and assume 'not' is False

    def __str__(self):
        if self.is_Not == False:
            return self.letter
        elif self.is_Not == True:
            return "not " + self.letter
        else:
            return self.letter + "is acting weird"
        
    def altPrint(self):
        if self.is_Not == False:
            return self.letter
        elif self.is_Not == True:
            return self.letter + "'"
        else:
            return self.letter + "is acting weird"
        
        
    def printParent(self):
        p1 = False
        p2 = False
        if not isinstance(self.parent1, str):
            p1 = True
            self.parent1.printParent()
        if not isinstance(self.parent2, str):
            p2 = True
            self.parent2.printParent()
        if self not in printedH:
            printedH.append(self)
            global HsPrinted
            HsPrinted += 1
            for h in hypothesi:
                if h >= self:
                    h.pnumb = HsPrinted
            global outputString
            global outputStrng
            outputString += str(HsPrinted) + ". " + str(self)
            outputStrng += str(HsPrinted) + ". " + self.altPrint()
            if self.parent1 == "hypothesis" or self.parent1 == "Hypothesis":
                outputString += ", Hypothesis"
                outputStrng += ", Hypothesis"
            if self.type == "hypothesis by deduction method":
                outputString += " by deduction method."
                outputStrng += " by deduction method."
            if p1:
                for h in hypothesi:
                    if h >= self.parent1:
                        try:
                            outputString += ", " + str(h.pnumb)
                            outputStrng += ", " + str(h.pnumb)
                        except:
                            print("Got error from trying this. here's the current output")
                            print(outputString)
                            print(outputStrng)
            if p2:
                for h in hypothesi:
                    if h >= self.parent2:
                        outputString += ", " + str(h.pnumb)
                        outputStrng += ", " + str(h.pnumb)
            if self.type != "none" and self.type != "hypothesis by deduction method":
                outputString += ", " + self.type
                outputStrng += ", " + self.type
            outputString += "\n"
            outputStrng += "\n"

        
    def clone(self):
        return Letter(self.letter, self.parent1, self.parent2, self.type, self.is_Not, self.istrue)

class OR:
    def __init__(self, letter1, letter2, parent1, parent2, typeOfGetThere, is_Not):
        
        self.letter1 = letter1
        self.letter2 = letter2
        self.parent1 = parent1
        self.parent2 = parent2
        self.type = typeOfGetThere
        self.is_Not = is_Not
        self.pnumb = 0

    def __str__(self):
        if not self.is_Not:
            return f"{self.letter1} or {self.letter2}"
        return f"not ({self.letter1} or {self.letter2})"
    
    def altPrint(self):
        returnStr = ""
        if self.is_Not:
            returnStr = "("
        if isinstance(self.letter1, Letter):
            returnStr += self.letter1.altPrint() + " ∨ "
        else:
            returnStr += f"({self.letter1.altPrint()}) ∨ "
        
        if isinstance(self.letter2, Letter):
            returnStr += self.letter2.altPrint()
        else:
            returnStr += f"({self.letter2.altPrint()})"
        if self.is_Not:
            returnStr += ")'"
        return returnStr
    
    def __eq__(self, value):
        if isinstance(value, OR):
            # Compare using Letter instances directly
            return ((self.letter1 >= value.letter1 and self.letter2 >= value.letter2) or
                    (self.letter1 >= value.letter2 and self.letter2 >= value.letter1)) and self.is_Not == value.is_Not
        return False
    
    def __ge__(self, value):
        return self == value
    
    def printParent(self):
        p1 = False
        p2 = False
        if not isinstance(self.parent1, str):
            p1 = True
            self.parent1.printParent()
        if not isinstance(self.parent2, str):
            p2 = True
            self.parent2.printParent()
        if self not in printedH:
            printedH.append(self)
            global HsPrinted
            HsPrinted += 1
            for h in hypothesi:
                if h >= self:
                    h.pnumb = HsPrinted
            global outputString
            global outputStrng
            outputString += str(HsPrinted) + ". " + str(self)
            outputStrng += str(HsPrinted) + ". " + self.altPrint()
            if self.parent1 == "hypothesis" or self.parent1 == "Hypothesis":
                outputString += ", Hypothesis"
                outputStrng += ", Hypothesis"
            if self.type == "hypothesis by deduction method":
                outputString += " by deduction method."
                outputStrng += " by deduction method."
            if p1:
                for h in hypothesi:
                    if h >= self.parent1:
                        outputString += ", " + str(h.pnumb)
                        outputStrng += ", " + str(h.pnumb)
            if p2:
                for h in hypothesi:
                    if h >= self.parent2:
                        outputString += ", " + str(h.pnumb)
                        outputStrng += ", " + str(h.pnumb)
            if self.type != "none" and self.type != "hypothesis by deduction method":
                outputString += ", " + self.type
                outputStrng += ", " + self.type
            outputString += "\n"
            outputStrng += "\n"
    
    def clone(self):
        return OR(self.letter1.clone(), self.letter2.clone(), self.parent1, self.parent2, self.type, self.is_Not)


class IMPLIES:
    def __init__(self, letter1, letter2, parent1=None, parent2=None, typeOfGetThere=None, is_Not=False):
        self.letter1 = letter1
        self.letter2 = letter2
        self.parent1 = parent1
        self.parent2 = parent2
        self.type = typeOfGetThere
        self.is_Not = is_Not
        self.pnumb = 0

    def __str__(self):
        if isinstance(self.letter1, IMPLIES):
            return f"({self.letter1}) implies {self.letter2}"
        if isinstance(self.letter2, IMPLIES):
            return f"{self.letter1} implies that {self.letter2}"
        return f"{self.letter1} implies {self.letter2}"
    
    def altPrint(self):
        returnStr = ""
        if isinstance(self.letter1, Letter):
            returnStr += self.letter1.altPrint() + " -> "
        else:
            returnStr += f"({self.letter1.altPrint()}) -> "

        if isinstance(self.letter2, Letter):
            returnStr += self.letter2.altPrint()
        else:
            returnStr += f"({self.letter2.altPrint()})"

        return returnStr
    
    def __eq__(self, value):
        if isinstance(value, IMPLIES):
            return self.letter1 >= value.letter1 and self.letter2 >= value.letter2 and self.is_Not == value.is_Not
        return False
    
    def __ge__(self, value):
        return self == value
    
    def printParent(self):
        p1 = False
        p2 = False
        if not isinstance(self.parent1, str):
            p1 = True
            self.parent1.printParent()
        if not isinstance(self.parent2, str):
            p2 = True
            self.parent2.printParent()
        if self not in printedH:
            printedH.append(self)
            global HsPrinted
            HsPrinted += 1
            for h in hypothesi:
                if h >= self:
                    h.pnumb = HsPrinted
            global outputString
            global outputStrng
            outputString += str(HsPrinted) + ". " + str(self)
            outputStrng += str(HsPrinted) + ". " + self.altPrint()
            if self.parent1 == "hypothesis" or self.parent1 == "Hypothesis":
                outputString += ", Hypothesis"
                outputStrng += ", Hypothesis"
            if self.type == "hypothesis by deduction method":
                outputString += " by deduction method."
                outputStrng += " by deduction method."
            if p1:
                for h in hypothesi:
                    if h >= self.parent1:
                        outputString += ", " + str(h.pnumb)
                        outputStrng += ", " + str(h.pnumb)
            if p2:
                for h in hypothesi:
                    if h >= self.parent2:
                        outputString += ", " + str(h.pnumb)
                        outputStrng += ", " + str(h.pnumb)
            if self.type != "none" and self.type != "hypothesis by deduction method":
                outputString += ", " + self.type
                outputStrng += ", " + self.type
            outputString += "\n"
            outputStrng += "\n"
    
    def clone(self):
        return IMPLIES(self.letter1.clone(), self.letter2.clone(), self.parent1, self.parent2, self.type, self.is_Not)


class AND:
    def __init__(self, letter1, letter2, parent1, parent2, typeOfGetThere, is_Not):
        
        self.letter1 = letter1
        self.letter2 = letter2
        self.parent1 = parent1
        self.parent2 = parent2
        self.type = typeOfGetThere
        self.is_Not = is_Not
        self.pnumb = 0

    def __str__(self):
        base_str = f"{self.letter1} and {self.letter2}"
        return f"not ({base_str})" if self.is_Not else base_str
    
    def altPrint(self):
        returnStr = ""
        if self.is_Not:
            returnStr += "("
        if isinstance(self.letter1, Letter):
            returnStr += self.letter1.altPrint() + " ^ "
        else:
            returnStr += f"({self.letter1.altPrint()}) ^ "

        if isinstance(self.letter2, Letter):
            returnStr += self.letter2.altPrint()
        else:
            returnStr += f"({self.letter2.altPrint()})"

        if self.is_Not:
            returnStr += ")'"
        return returnStr
    
    def __eq__(self, value):
        if isinstance(value, AND):
            return ((self.letter1 >= value.letter1 and self.letter2 >= value.letter2) or
                    (self.letter1 >= value.letter2 and self.letter2 >= value.letter1)) and self.is_Not == value.is_Not
        return False
    
    def __ge__(self, value):
        return self == value
    
    def printParent(self):
        p1 = False
        p2 = False
        if not isinstance(self.parent1, str):
            p1 = True
            self.parent1.printParent()
        if not isinstance(self.parent2, str):
            p2 = True
            self.parent2.printParent()
        if self not in printedH:
            printedH.append(self)
            global HsPrinted
            HsPrinted += 1
            for h in hypothesi:
                if h >= self:
                    h.pnumb = HsPrinted
            global outputString
            global outputStrng
            outputString += str(HsPrinted) + ". " + str(self)
            outputStrng += str(HsPrinted) + ". " + self.altPrint()
            if self.parent1 == "hypothesis" or self.parent1 == "Hypothesis":
                outputString += ", Hypothesis"
                outputStrng += ", Hypothesis"
            if self.type == "hypothesis by deduction method":
                outputString += " by deduction method."
                outputStrng += " by deduction method."
            if p1:
                for h in hypothesi:
                    if h >= self.parent1:
                        outputString += ", " + str(h.pnumb)
                        outputStrng += ", " + str(h.pnumb)
            if p2:
                for h in hypothesi:
                    if h >= self.parent2:
                        outputString += ", " + str(h.pnumb)
                        outputStrng += ", " + str(h.pnumb)
            if self.type != "none" and self.type != "hypothesis by deduction method":
                outputString += ", " + self.type
                outputStrng += ", " + self.type
            outputString += "\n"
            outputStrng += "\n"
    
    def checkTrue(self):
        l1t = "unknown"
        l2t = "unknown"
        for ls in letters:
            if ls == self.letter1 and ls.istrue != "unknown":
                l1t = ls.istrue != self.letter1.is_Not
            if ls == self.letter2 and ls.istrue != "unknown":
                l2t = ls.istrue != self.letter2.is_Not
        if l1t == "unknown" or l2t == "unknown":
            return False
        if not self.is_Not:
            return l1t and l2t
        return not (l1t and l2t)
    
    def checkFalse(self):
        l1t = "unknown"
        l2t = "unknown"
        for ls in letters:
            if ls == self.letter1 and ls.istrue != "unknown":
                l1t = ls.istrue != self.letter1.is_Not
            if ls == self.letter2 and ls.istrue != "unknown":
                l2t = ls.istrue != self.letter2.is_Not
        if l1t == "unknown" or l2t == "unknown":
            return False
        if self.is_Not:
            return l1t and l2t
        return not (l1t and l2t)
    
    def clone(self):
        return AND(self.letter1.clone(), self.letter2.clone(), self.parent1, self.parent2, self.type, self.is_Not)


def cycleThrough(conclusion):

    global outputString
    global outputStrng
    global hypothesi
    global printedH
    global HsPrinted
    global letters
    printedH.clear()
    HsPrinted = 0
    
    print([str(h) for h in hypothesi])


    for h1 in hypothesi:
        for h2 in hypothesi:
            if isinstance(h1, Letter) and isinstance(h2, IMPLIES):
                # If h1 is thaZSe left-hand side of the IMPLIES and is true
                if h1 >= h2.letter1:
                        newH2 = h2.letter2.clone()
                        if isinstance(newH2, Letter):
                            newH2.istrue = not newH2.is_Not
                            newH2.parent1= h1
                            newH2.parent2 = h2
                            newH2.type = "Modus Ponens"
                            if newH2 not in hypothesi:
                                hypothesi.append(newH2)
                            for letter in letters:
                                if letter == newH2:
                                    letter.istrue = newH2.istrue
                                    break
                        else:
                                newH2.parent1 = h1
                                newH2.parent2 = h2
                                newH2.type = "Modus Ponens"
                                if newH2 not in hypothesi:
                                    hypothesi.append(newH2)

                # If h1 is the right-hand side of the IMPLIES and is false
                elif h1 == h2.letter2 and h1.istrue == h2.letter2.is_Not:
                    if isinstance(h2.letter1, Letter):
                        l1_negated = h2.letter1.clone()
                        l1_negated.is_Not = not l1_negated.is_Not  # Negate the letter
                        l1_negated.istrue = not l1_negated.is_Not
                        l1_negated.parent1 = h1
                        l1_negated.parent2 = h2
                        l1_negated.type = "modus tollens"
                        if l1_negated not in hypothesi:
                            hypothesi.append(l1_negated)
                            for letter in letters:
                                if letter == l1_negated:
                                    letter.istrue = l1_negated.istrue
                                    break
                    elif not isinstance(h2.letter1, IMPLIES):
                        newH2 = h2.letter1.clone()
                        newH2.is_Not = not newH2.is_Not
                        if newH2 not in hypothesi:
                            hypothesi.append(newH2)
            if isinstance(h2, Letter) and isinstance(h1, IMPLIES):
                # If h1 is the left-hand side of the IMPLIES and is true
                if h2 >= h1.letter1:
                        newH1 = h1.letter1.clone()
                        if isinstance(newH1, Letter):
                            newH1.istrue = not newH1.is_Not
                            newH1.parent2= h2
                            newH1.parent1 = h1
                            newH1.type = "Modus Ponens"
                            if newH1 not in hypothesi:
                                hypothesi.append(newH1)
                            for letter in letters:
                                if letter == newH1:
                                    letter.istrue = newH1.istrue
                                    break
                        elif isinstance(newH1, AND):
                                newH1.parent1 = h1
                                newH1.parent2 = h2
                                newH1.type = "Modus Ponens"
                                if newH1 not in hypothesi:
                                    hypothesi.append(newH1)

                # If h1 is the right-hand side of the IMPLIES and is false
                elif h2 == h1.letter2 and h2.istrue == h1.letter2.is_Not:
                    if isinstance(h1.letter1, Letter):
                        l1_negated = h1.letter1.clone()
                        l1_negated.is_Not = not l1_negated.is_Not  # Negate the letter
                        l1_negated.istrue = not l1_negated.is_Not
                        l1_negated.parent1 = h1
                        l1_negated.parent2 = h2
                        l1_negated.type = "modus tollens"
                        if l1_negated not in hypothesi:
                            hypothesi.append(l1_negated)
                            for letter in letters:
                                if letter == l1_negated:
                                    letter.istrue = l1_negated.istrue
                                    break
                    if not isinstance(h1.letter1, IMPLIES):
                        newH1 = h1.letter1.clone()
                        newH1.is_Not = not newH1.is_Not
                        if newH1 not in hypothesi:
                            hypothesi.append(newH1)
            if isinstance(h1, IMPLIES) and isinstance(h2, IMPLIES):
                if h1.letter2 >= h2.letter1 and h1.is_Not == h2.is_Not:
                    newImp = IMPLIES(h1.letter1.clone(), h2.letter2.clone(), h1, h2, "transitive", h1.is_Not)

                    # Ensure no invalid implications (e.g., A > not A)
                    if newImp.letter1 == newImp.letter2 and newImp.letter1.is_Not != newImp.letter2.is_Not:
                        continue  # Skip invalid implications
                    
                    # Avoid adding duplicates
                    if newImp not in hypothesi:
                        hypothesi.append(newImp)

                        # Apply the "or logic" directly for the new implication
                        l1 = newImp.letter1.clone()
                        l2 = newImp.letter2.clone()
                        
                        # Add conditional disjunction (A > B becomes not A or B)
                        l1.is_Not = not l1.is_Not
                        newOr = OR(l1, l2, newImp, "none", "conditional disjunction", h1.is_Not)
                        if newOr not in hypothesi:
                            hypothesi.append(newOr)

                if h1.letter1 == h2.letter1 and h1.letter1.is_Not != h2.letter1.is_Not and h1.letter2 >= h2.letter2:
                        newL = h1.letter2.clone()
                        newL.parent1 = h1
                        newL.parent2 = h2
                        newL.type = "proof by cases"
                        if newL not in hypothesi:
                            hypothesi.append(newL)
            if isinstance(h1, IMPLIES):
                if h1.letter1 >= h2:
                        newH2 = h1.letter2.clone()
                        if isinstance(newH2, Letter):
                            newH2.istrue = not newH2.is_Not
                            newH2.parent1= h1
                            newH2.parent2 = h2
                            newH2.type = "Modus Ponens"
                            if newH2 not in hypothesi:
                                hypothesi.append(newH2)
                            for letter in letters:
                                if letter == newH2:
                                    letter.istrue = newH2.istrue
                                    break
                        elif isinstance(newH2, AND):
                                if newH2 not in hypothesi:
                                    hypothesi.append(newH2)
            if isinstance(h2, IMPLIES):
                if h2.letter1 >= h1:
                        newH2 = h2.letter2.clone()
                        if isinstance(newH2, Letter):
                            newH2.istrue = not newH2.is_Not
                            newH2.parent1= h1
                            newH2.parent2 = h2
                            newH2.type = "Modus Ponens"
                            if newH2 not in hypothesi:
                                hypothesi.append(newH2)
                            for letter in letters:
                                if letter == newH2:
                                    letter.istrue = newH2.istrue
                                    break
                        elif isinstance(newH2, AND):
                                if newH2 not in hypothesi:
                                    hypothesi.append(newH2)

            if isinstance(h1, OR) and isinstance(h1.letter1, Letter) and isinstance(h1.letter2, Letter) and isinstance(h2, Letter) and not h1.is_Not and not h2 == h1.letter1 and not h2 == h1.letter2:
                newOREO = OR(AND(h1.letter1.clone(), h2.clone(), h1.clone(), h2.clone(), "Distributive", False), AND(h1.letter2.clone(), h2.clone(), h1.clone(), h2.clone(), "Distributive", False), h1, h2, "Distributive", False)
                if newOREO not in hypothesi:
                    hypothesi.append(newOREO)
            if isinstance(h2, OR) and isinstance(h2.letter1, Letter) and isinstance(h2.letter2, Letter) and isinstance(h1, Letter) and not h2.is_Not and not h1 == h2.letter1 and not h1 == h2.letter2:
                newOREY = OR(AND(h1.clone(), h2.letter1.clone(), h1.clone(), h2.clone(), "Distributive", False), AND(h1.clone(), h2.letter2.clone(), h1.clone(), h2.clone(), "Distributive", False), h1, h2, "Distributive", False)
                if newOREY not in hypothesi:
                    hypothesi.append(newOREY)
            if isinstance(h2, AND):
                if not h2.is_Not:
                    l1s = h2.letter1.clone()
                    l1s.istrue = not l1s.is_Not
                    l2s = h2.letter2.clone()
                    l2s.istrue = not l2s.is_Not
                    l1s.parent1 = h2
                    l1s.type = h2.type
                    l2s.parent1 = h2
                    l2s.type = h2.type
                    if l1s not in letters and isinstance(l1s, Letter):
                        letters.append(l1s)
                    if l2s not in letters and isinstance(l2s, Letter):
                        letters.append(l2s)
                    for letter in letters:
                        if letter == l1s:
                            letter.istrue = l1s.istrue
                        if letter == l2s:
                            letter.istrue = l2s.istrue
                    if l1s not in hypothesi:
                        hypothesi.append(l1s)
                    if l2s not in hypothesi:
                        hypothesi.append(l2s)

                    orl1 = l1s.clone()
                    orl2 = l2s.clone()
                    orl1.is_Not = not orl1.is_Not
                    orl2.is_Not = not orl2.is_Not
                    newOR = OR(orl1, orl2, h2, "none", "De Morgan's law", True)
                    if newOR not in hypothesi:
                        hypothesi.append(newOR)
                else:
                    l1s = h2.letter1.clone()
                    l1s.is_Not = not l1s.is_Not
                    l2s = h2.letter2.clone()
                    l2s.is_Not = not l2s.is_Not

                    newOr = OR(l1s, l2s, h2, "none", "De Morgan's law", False)
                    if newOr not in hypothesi:
                        hypothesi.append(newOr)
            if isinstance(h2, OR) and not h2.is_Not:
                        notA = h2.letter1.clone()
                        notA.is_Not = not notA.is_Not
                        newImp1 = IMPLIES(notA, h2.letter2, h2, "none", "Conditional Dysjunction", False)
                        if newImp1 not in hypothesi:
                            hypothesi.append(newImp1)

                        notB = h2.letter2.clone()
                        notB.is_Not = not notB.is_Not
                        newImp2 = IMPLIES(notB, h2.letter1, h2, "none", "Conditional Dysjunction", False)
                        if newImp2 not in hypothesi:
                            hypothesi.append(newImp2)

                        if h2.letter1 >= h2.letter2:
                            newL = h2.letter1.clone()
                            newL.parent1 = h2
                            newL.type = "Self Refrence"
                            if newL not in hypothesi:
                                hypothesi.append(newL)

            if isinstance(h2, IMPLIES) and isinstance(h2.letter1, AND) and h2.letter1 >= h1:
                        newH2 = h2.letter2.clone()
                        if isinstance(newH2, Letter):
                            newH2.istrue = not newH2.is_Not
                            newH2.parent1 = h2
                            newH2.parent2 = h1
                            newH2.type = "Modus Ponens"
                            if newH2 not in hypothesi:
                                hypothesi.append(newH2)
                            for letter in letters:
                                if letter == newH2:
                                    letter.istrue = newH2.istrue
                                    break
                        elif isinstance(newH2, AND):
                                newH2.parent1 = h2
                                newH2.type = "Modus Ponens"
                                if newH2 not in hypothesi:
                                    hypothesi.append(newH2)
            if isinstance(h1, IMPLIES) and isinstance(h1.letter1, AND) and h1.letter1 >= h2:
                        newH2 = h1.letter2.clone()
                        if isinstance(newH2, Letter):
                            newH2.istrue = not newH2.is_Not
                            newH2.parent1 = h2
                            newH2.parent2 = h1
                            newH2.type = "Modus Ponens"
                            if newH2 not in hypothesi:
                                hypothesi.append(newH2)
                            for letter in letters:
                                if letter == newH2:
                                    letter.istrue = newH2.istrue
                                    break
                        elif isinstance(newH2, AND):
                                newH2.parent1 = h2
                                newH2.type = "Modus Ponens"
                                if newH2 not in hypothesi:
                                    hypothesi.append(newH2)
            if isinstance(h1, Letter) and isinstance(h2, Letter) and not h1 == h2:
                newAND = AND(h1.clone(), h2.clone(), h1, h2, "Conjunction", False)
                if newAND not in hypothesi:
                    hypothesi.append(newAND)

    hypothesi = [
        h for h in hypothesi
        if not (isinstance(h, IMPLIES) and h.letter1 == h.letter2)
    ]

    
    print([str(h) for h in hypothesi])

    for h in hypothesi:
        if h.type == "none" or h.type == "hypothesis by deduction method":
            h.printParent()

        # Check the conclusion
    hasntThing = True
    for i in hypothesi:
        if i >= conclusion:
            hasntThing = False
            i.printParent()

    if hasntThing:
        if isinstance(conclusion, IMPLIES):
            outputString = ""
            outputStrng = ""

            while isinstance(conclusion, IMPLIES):
                outputString += "Because this conclusion only matters if " + str(conclusion.letter1) + " is true, then we can assume that it is, and place it in our hypotheses. This also means our new conclusion is " + str(conclusion.letter2) + "\n"
                outputStrng += "Because this conclusion only matters if " + conclusion.letter1.altPrint() + " is true, then we can assume that it is, and place it in our hypotheses. This also means our new conclusion is " + conclusion.letter2.altPrint() + "\n"
                conclusion.letter1.parent1 = "hypothesis"
                conclusion.letter1.type = "hypothesis by deduction method"
                hypothesi.append(conclusion.letter1)
                conclusion = conclusion.letter2

            cycleThrough(conclusion)
        else:
            outputString = "Unfortunately, your inputted hypothesis does not derive this conclusion"
            outputStrng = "Unfortunately, your inputted hypothesis does not derive this conclusion"

    returnJson = {
        "String": outputString,
        "Symbol": outputStrng
    }

    return json.dumps(returnJson)


# Input hypothesis
def solve(hypothisis, conclusionn):

    global outputString
    global outputStrng
    global hypothesi
    global printedH
    global HsPrinted
    global letters

    hypothisis = fixString(hypothisis)
    hypothisises = []
    hypothesi.clear()
    outputString = ""
    outputStrng = ""
    letters.clear()
    printedH.clear()
    HsPrinted = 0

    parserString = ""
    inThing = 0
    for index, char in enumerate(hypothisis):
        if char == "(":
            inThing += 1
        if char == ")":
            inThing -= 1
        if char == "^" and inThing <= 0:
            hypothisises.append(parserString)
            parserString = ""
        else:
            parserString += char
        
    if parserString != "":
        hypothisises.append(parserString)


    def parse_and(component):
        ore = "v" in component
        andy = "^" in component
        imp = ">" in component
        wholeisNot = ")'" in component
        component = component.replace("(", "").replace(")'", "").replace(")", "")
        coms = [component]
        if ore:
            coms = component.split("v")
        if andy:
            coms = component.split("^")
        if imp:
            coms = component.split(">")
        isnt = "'" in coms[0]
        base_letter = coms[0].replace("'", "")
        letter1 = Letter(base_letter, "hypothesis", "hypothesis", "none", isnt, "unknown")
        letter2 = "none"
        if coms.__len__() > 1 and coms[1] != "":  
            isnt2 = "'" in coms[1]
            base_letter = coms[1].replace("'", "")
            letter2 = Letter(base_letter, "hypothesis", "hypothesis", "none", isnt2, "unknown") 
        if ore:
            return OR(letter1, letter2, "none", "none", "none", wholeisNot)
        elif andy:
            return AND(letter1, letter2, "none", "none", "none", wholeisNot)
        elif imp:
            return IMPLIES(letter1, letter2, "none", "none", "none", wholeisNot)
        else:
            return letter1

    def split_logic_string(i: str):
        result = []
        current = ""
        
        for index, char in enumerate(i):
            if char == '(':
                if current != "":
                    result.append(str(current))
                current = "("
            elif char == ')': 
                current += ")"
                result.append(str(current))
                current = ""
            elif char == "'" and current == "":
                holdUp = result.pop()
                holdUp += "'"
                result.append(holdUp)
            elif current == "" and char in {'>', 'v', '^'}:
                result.append(char)
            else:
                current += char
        
        if current != "":
            result.append(current)
        
        return result

    for i in hypothisises:
        if "(" in i and ")" in i:
            newEye = split_logic_string(i)
            if newEye.__len__() > 1:
                wholeNot = ")'" in newEye
                if not wholeNot:
                    finalEntry = newEye[newEye.__len__() - 1]
                    wholeNot = ")'" in finalEntry and finalEntry.replace(")'", "").__len__() == 1
                ore = "v" in newEye
                andy = "^" in newEye
                imp = ">" in newEye
                index = 0
                while newEye[index].replace("(", "").replace(")", "").replace("'", "").replace("v", "").replace("^", "").replace(">", "") == "":
                    index += 1
                letter1 = parse_and(newEye[index])
                index += 1
                while newEye[index].replace("(", "").replace(")", "").replace("'", "").replace("v", "").replace("^", "").replace(">", "") == "":
                    index += 1
                letter2 = parse_and(newEye[index])
                if not ore and not andy and not imp:
                    if isinstance(letter1, OR):
                        newOR = OR(letter1.letter1, letter2, "hypothesis", "hypothesis", "none", wholeNot)
                        hypothesi.append(newOR)
                    if isinstance(letter1, AND):
                        newAND = AND(letter1.letter1, letter2, "hypothesis", "hypothesis", "none", wholeNot)
                        hypothesi.append(newAND)
                    if isinstance(letter1, IMPLIES):
                        newIMP = IMPLIES(letter1.letter1, letter2, "hypothesis", "hypotheis", "none", wholeNot)
                        hypothesi.append(newIMP)
                if ore:
                    newOR = OR(letter1, letter2, "hypothesis", "hypothesis", "none", wholeNot)
                    hypothesi.append(newOR)
                if andy:
                    newOR = AND(letter1, letter2, "hypothesis", "hypothesis", "none", wholeNot)
                    hypothesi.append(newOR)
                if imp:
                    newOR = IMPLIES(letter1, letter2, "hypothesis", "hypothesis", "none", wholeNot)
                    hypothesi.append(newOR)
            else:
                hypothisises.append(i.replace("(", ""))

        else:
            if "v" in i:  # Process OR
                components = i.split("v")
                letter1 = parse_and(components[0])  # Use parse_and for letter1
                letter2 = parse_and(components[1])  # Use parse_and for letter2

                is_not = False
                if isinstance(letter2, Letter):
                    is_not = i.endswith(")'")
                elif isinstance(letter2, AND):
                        if letter2.is_Not:
                            is_not = i.endswith(")')'")
                        else:
                            is_not = i.endswith(")'")
                newOr = OR(letter1, letter2, "hypothesis", "hypothesis", "none", is_not)
                hypothesi.append(newOr)

                if not is_not:
                        notA = letter1.clone()
                        notA.is_Not = not notA.is_Not
                        newImp1 = IMPLIES(notA, letter2, newOr, "none", "Conditional Dysjunction", False)
                        if newImp1 not in hypothesi:
                            hypothesi.append(newImp1)

                        notB = letter2.clone()
                        notB.is_Not = not notB.is_Not
                        newImp2 = IMPLIES(notB, letter1, newOr, "none", "Conditional Dysjunction", False)
                        if newImp2 not in hypothesi:
                            hypothesi.append(newImp2)

            # Process IMPLIES
            elif ">" in i:  # Process IMPLIES
                components = i.split(">")
                letter1 = parse_and(components[0])  # Use parse_and for letter1
                letter2 = parse_and(components[1])  # Use parse_and for letter2

                is_not = False
                if isinstance(letter2, Letter):
                    is_not = i.endswith(")'")
                else:
                    if isinstance(letter2, AND):
                        if letter2.is_Not:
                            is_not = i.endswith(")')'")
                        else:
                            is_not = i.endswith(")'")
                newImplies = IMPLIES(letter1, letter2, "hypothesis", "hypothesis", "none", is_not)
                hypothesi.append(newImplies)
            elif "^" in i:  # AND statement
                components = i.replace("(", "").replace(")'", "").replace(")", "").split("^")
                wholeNot = ")'" in i
                letter1, letter2 = components[0], components[1]

                is_not_1 = "'" in letter1
                base_letter1 = letter1.replace("'", "")
                letter_obj1 = Letter(base_letter1, "hypothesis", "hypothesis", "none",  is_not_1, "unknown")
                if letter_obj1 not in letters and isinstance(letter_obj1, Letter):
                    letters.append(letter_obj1)

                is_not_2 = "'" in letter2
                base_letter2 = letter2.replace("'", "")
                letter_obj2 = Letter(base_letter2, "hypothesis", "hypothesis", "none",  is_not_2, "unknown")
                if letter_obj2 not in letters and isinstance(letter_obj2, Letter):
                    letters.append(letter_obj2)

                conclusion = AND(letter_obj1, letter_obj2, "conclusion", "conclusion", "none", False)
            else:  # Process single-letter hypothesis
                is_not = "'" in i
                base_letter = i.replace("'", "")
                newLetter = Letter(base_letter, "hypothesis", "hypothesis", "none",  is_not, not is_not)  # True for positive, False for negative
                if newLetter not in letters and isinstance(newLetter, Letter):
                    letters.append(newLetter)
                else:  # Update `istrue` if the letter already exists
                    for letter in letters:
                        if letter.letter == base_letter:
                            letter.istrue = not is_not
                hypothesi.append(newLetter)

    # Input conclusion (optional)
    solve = fixString(conclusionn)

    conclusion = ""

    # Process the statement based on its type
    newEye = split_logic_string(solve)
    if "(" in solve and ")" in solve and newEye.__len__() > 1:
            newEye = split_logic_string(solve)
            wholeNot = ")'" in newEye
            if not wholeNot:
                finalEntry = newEye[newEye.__len__() - 1]
                wholeNot = ")'" in finalEntry and finalEntry.replace(")'", "").__len__() == 1
            ore = "v" in newEye
            andy = "^" in newEye
            imp = ">" in newEye
            index = 0
            while newEye[index].replace("(", "").replace(")", "").replace("'", "").replace("v", "").replace("^", "").replace(">", "") == "":
                index += 1
            letter1 = parse_and(newEye[index])
            index += 1
            while newEye[index].replace("(", "").replace(")", "").replace("'", "").replace("v", "").replace("^", "").replace(">", "") == "":
                index += 1
            letter2 = parse_and(newEye[index])
            if not ore and not andy and not imp:
                if isinstance(letter1, OR):
                    newOR = OR(letter1.letter1, letter2, "hypothesis", "hypothesis", "none", wholeNot)
                    conclusion = newOR
                if isinstance(letter1, AND):
                    newAND = AND(letter1.letter1, letter2, "hypothesis", "hypothesis", "none", wholeNot)
                    conclusion = newAND
                if isinstance(letter1, IMPLIES):
                    newIMP = IMPLIES(letter1.letter1, letter2, "hypothesis", "hypotheis", "none", wholeNot)
                    conclusion = newIMP
            if ore:
                newOR = OR(letter1, letter2, "hypothesis", "hypothesis", "none", wholeNot)
                conclusion = newOR
            if andy:
                newOR = AND(letter1, letter2, "hypothesis", "hypothesis", "none", wholeNot)
                conclusion = newOR
            if imp:
                newOR = IMPLIES(letter1, letter2, "hypothesis", "hypothesis", "none", wholeNot)
                conclusion = newOR

    else:
            if "v" in solve:  # OR statement
                wholeNot = ")'" in solve
                components = solve.replace("(", "").replace(")'", "").replace(")", "").split("v")
                letter1, letter2 = components[0], components[1]

                is_not_1 = "'" in letter1
                base_letter1 = letter1.replace("'", "")
                letter_obj1 = Letter(base_letter1, "hypothesis", "hypothesis", "none",  is_not_1, "unknown")
                if letter_obj1 not in letters and isinstance(letter_obj1, Letter):
                    letters.append(letter_obj1)

                is_not_2 = "'" in letter2
                base_letter2 = letter2.replace("'", "")
                letter_obj2 = Letter(base_letter2, "hypothesis", "hypothesis", "none", is_not_2,  "unknown")
                if letter_obj2 not in letters and isinstance(letter_obj2, Letter):
                    letters.append(letter_obj2)

                conclusion = OR(letter_obj1, letter_obj2, "conclusion", "conclusion", "none", wholeNot)

            elif ">" in solve: 
                wholeNot = ")'" in solve # IMPLIES statement
                components = solve.replace("(", "").replace(")'", "").replace(")", "").split(">")
                letter1, letter2 = components[0], components[1]

                is_not_1 = "'" in letter1
                base_letter1 = letter1.replace("'", "")
                letter_obj1 = Letter(base_letter1, "hypothesis", "hypothesis", "none",  is_not_1, "unknown")
                if letter_obj1 not in letters and isinstance(letter_obj1, Letter):
                    letters.append(letter_obj1)

                is_not_2 = "'" in letter2
                base_letter2 = letter2.replace("'", "")
                letter_obj2 = Letter(base_letter2, "hypothesis", "hypothesis", "none",  is_not_2, "unknown")
                if letter_obj2 not in letters and isinstance(letter_obj2, Letter):
                    letters.append(letter_obj2)

                conclusion = IMPLIES(letter_obj1, letter_obj2, "conclusion", "conclusion", "none", wholeNot)

            elif "^" in solve:  # AND statement
                wholeNot = ")'" in solve
                components = solve.replace("(", "").replace(")'", "").replace(")", "").split("^")
                letter1, letter2 = components[0], components[1]

                is_not_1 = "'" in letter1
                base_letter1 = letter1.replace("'", "")
                letter_obj1 = Letter(base_letter1, "hypothesis", "hypothesis", "none",  is_not_1, "unknown")
                if letter_obj1 not in letters and isinstance(letter_obj1, Letter):
                    letters.append(letter_obj1)

                is_not_2 = "'" in letter2
                base_letter2 = letter2.replace("'", "")
                letter_obj2 = Letter(base_letter2, "hypothesis", "hypothesis", "none",  is_not_2, "unknown")
                if letter_obj2 not in letters and isinstance(letter_obj2, Letter):
                    letters.append(letter_obj2)

                conclusion = AND(letter_obj1, letter_obj2, "conclusion", "conclusion", "none", wholeNot)

            else:  # Single letter
                is_not = "'" in solve
                base_letter = solve.replace("'", "")
                letter_obj = Letter(base_letter, "hypothesis", "hypothesis", "none",  is_not, "unknown")
                if letter_obj not in letters and isinstance(letter_obj, Letter):
                    letters.append(letter_obj)
                else:
                    for letter in letters:
                        if letter.letter == base_letter:
                            letter.istrue = not is_not
                conclusion = letter_obj


    if isinstance(conclusion, IMPLIES) and conclusion.is_Not:
        outputString += "Because the conclusion is " + str(conclusion) + ", and A > B is the same as A' v B, then we can rearange the conclusion as: "
        outputStrng += "Because the conclusion is " + str(conclusion) + ", and A > B is the same as A' v B, then we can rearange the conclusion as: "
        l1 = conclusion.letter1.clone()
        l1.is_Not = not l1.is_Not
        conclusion = OR(l1, conclusion.letter2, conclusion.parent1, conclusion.parent2, conclusion.type, True)
        outputString += str(conclusion) + "\n"
        outputStrng += str(conclusion) + "\n"

    # Output the parsed conclusion
    print("Parsed Conclusion:", conclusion)
                    
    print([str(h) for h in hypothesi])

    # Add transitive implications to the hypotheses
    # Add transitive implications to the hypotheses
    for i in hypothesi:
        if isinstance(i, OR):
            # If 'is_Not' is True in the OR, handle as specified
            if isinstance(i.letter1, AND) and not i.letter1.is_Not:
                newOr1 = OR(i.letter1.letter1, i.letter2, i, "none", "Distributive", i.is_Not)
                newOr2 = OR(i.letter1.letter2, i.letter2, i, "none", "Distributive", i.is_Not)
                if newOr1 not in hypothesi:
                    hypothesi.append(newOr1)
                if newOr2 not in hypothesi:
                    hypothesi.append(newOr2)
            if isinstance(i.letter2, AND) and not i.letter2.is_Not:
                newOr1 = OR(i.letter2.letter1, i.letter1, i, "none", "Distributive", i.is_Not)
                newOr2 = OR(i.letter2.letter2, i.letter1, i, "none", "Distributive", i.is_Not)
                if newOr1 not in hypothesi:
                    hypothesi.append(newOr1)
                if newOr2 not in hypothesi:
                    hypothesi.append(newOr2)
            if i.is_Not:
                # Add both letters with the opposite is_Not and their istrue as the opposite of the new is_Not
                letter1_opposite = i.letter1.clone()
                letter2_opposite = i.letter2.clone()
                
                # Set the opposite of 'is_Not' for both letters
                letter1_opposite.is_Not = not letter1_opposite.is_Not
                letter2_opposite.is_Not = not letter2_opposite.is_Not

                newAND = AND(letter1_opposite, letter2_opposite, i, "none", "De Morgan's law", False)
                if newAND not in hypothesi:
                    hypothesi.append(newAND)
        if isinstance(i, AND):
            if i.is_Not:
                letter1_opposite = i.letter1.clone()
                letter2_opposite = i.letter2.clone()

                letter1_opposite.is_Not = not letter1_opposite.is_Not
                letter2_opposite.is_Not = not letter2_opposite.is_Not

                newOr = OR(letter1_opposite, letter2_opposite, i, "none", "De Morgan's law", False)
                if newOr not in hypothesi:
                    hypothesi.append(newOr)
            else:
                l1c = i.letter1.clone()
                l2c = i.letter2.clone()

                l1c.istrue = not l1c.is_Not
                l2c.istrue = not l2c.is_Not

                l1c.type = i.type
                l2c.type = i.type

                l1c.parent1 = i
                l2c.parent1 = i

                if l1c not in hypothesi:
                    hypothesi.append(l1c)
                if l2c not in hypothesi:
                    hypothesi.append(l2c)
        if isinstance(i, IMPLIES):
            l1 = i.letter1.clone()
            l2 = i.letter2.clone()
            
            if not isinstance(l2, IMPLIES):
                # Add conditional disjunction (A > B becomes not A or B)
                l1.is_Not = not l1.is_Not
                newOr = OR(l1, l2, i, "none", "conditional disjunction", False)
                if newOr not in hypothesi:
                    hypothesi.append(newOr)

                # Add contrapositive (A > B becomes not B > not A)
                l3 = l2.clone()
                l3.is_Not = not l3.is_Not
                newImp = IMPLIES(l3, l1, i, "none", "Contraposition", False)
                if newImp not in hypothesi:
                    hypothesi.append(newImp)
            
            if isinstance(i.letter1, AND) and not i.letter1.is_Not:
                newImplies1 = IMPLIES(i.letter1.letter1, IMPLIES(i.letter1.letter2, i.letter2, i, "none", "Exportation", False), i, "none", "Exportation", False)
                if newImplies1 not in hypothesi:
                    hypothesi.append(newImplies1)
                newImplies2 = IMPLIES(i.letter1.letter2, IMPLIES(i.letter1.letter1, i.letter2, i, "none", "Exportation", False), i, "none", "Exportation", False)
                if newImplies2 not in hypothesi:
                    hypothesi.append(newImplies2)
        if isinstance(i, Letter):
            for letter in letters:
                if letter.letter == i.letter:
                    letter.istrue = i.istrue  # Set istrue to the opposite of is_Not

    # Double for loop to add valid transitive implications
    # Check the conclusion and update based on single letters and implications
    return cycleThrough(conclusion)
