# compositions_solver.py
# Author: Mathias Buchanan
# Solves: 4.4 permutation problems

import json

def strike(text):
    return ''.join(c + '\u0336' for c in str(text))

def prime_factors(n):
    i = 2
    factors = []
    while i * i <= n:
        while n % i == 0:
            factors.append(i)
            n //= i
        i += 1
    if n > 1:
        factors.append(n)
    return factors

def solve(setOneSize, setTwoSize):
    if isinstance(setOneSize, str):
        setOneSize = int(setOneSize)
    if isinstance(setTwoSize, str):
        setTwoSize = int(setTwoSize)

    i = setOneSize
    j = setOneSize - setTwoSize

    # Permutations string
    k = i - 1
    permutations = str(i)
    while k > j:
        permutations += " * " + str(k)
        k -= 1

    # Combination logic
    denominator = list(range(2, setTwoSize + 1)) if j > setTwoSize else list(range(2, j + 1))
    if j <= setTwoSize:
        j = setTwoSize

    numerator_values = list(range(i, j, -1))
    composition_parts = []
    final_denominator_parts = []

    printThing = {}
    t = 0
    while t < denominator.__len__():

        printThing[denominator[t]] = denominator[t]

        t += 1

    fakeDenominator = [h for h in denominator]

    k = i
    while k > j:

        usingNumb = k
        printedString = str(usingNumb)
        h = fakeDenominator.__len__() - 1
        while h >= 0:
            if isinstance(fakeDenominator[h], int) and fakeDenominator[h] > 1:
                if usingNumb % fakeDenominator[h] == 0:
                    usingNumb //= fakeDenominator[h]
                    fakeDenominator[h] = 1
                    printedString = printedString + " " + str(usingNumb)
                else:
                    t = fakeDenominator[h]
                    while t > 1:

                        if usingNumb % t == 0 and fakeDenominator[h] % t == 0:
                            usingNumb //= t
                            print("yo")
                            fakeDenominator[h] //= t
                            print("yo")
                            printedString = printedString + " " + str(usingNumb)
                            print("yo")
                            printThing[denominator[h]] = str(printThing[denominator[h]]) + " " + str(fakeDenominator[h])
                            print(printThing[denominator[h]])

                        t -= 1
            h -= 1
        
        printedStrings = printedString.split(" ")
        printedString = ""
        p = 0
        while p < printedStrings.__len__() - 1:
            printedString += strike(printedStrings[p]) + " "
            p += 1
        printedString += printedStrings[p]
        
        composition_parts.append(printedString)


        k -= 1

    t = 0
    print(printThing)
    while t < denominator.__len__():
        splitString = str(printThing[denominator[t]]).split(" ")
        if splitString.__len__() == 1:
            if denominator[t] == fakeDenominator[t]:
                final_denominator_parts.append(splitString[0] + " ")
            else:
                final_denominator_parts.append(strike(splitString[0]) + " ")
        elif fakeDenominator[t] == 1:
            tempString = ""
            for s in splitString:
                tempString += strike(s) + " "
            final_denominator_parts.append(tempString)
        else:
            tempString = ""
            s = 0
            while s < splitString.__len__() - 1:
                tempString += strike(splitString[s]) + " "
                s += 1
            tempString += splitString[s] + " "
        t += 1


    compositions = " * ".join(composition_parts)
    denom = "* ".join(final_denominator_parts)

    if setOneSize == setTwoSize:
        compositions = "1"

    result = {
        "perm": permutations,
        "comp": compositions,
        "denom": denom
    }

    return json.dumps(result)