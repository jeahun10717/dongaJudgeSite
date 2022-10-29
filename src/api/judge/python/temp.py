import os
import time
from shutil import copyfile

# Change Area
FileName = "matrix.cpp"
ExeName = "matrix"
ProblemNum = 3
JudgeFileNum = 3 # 1 to 10 [, )

os.system("g++ " + FileName + " -o " + ExeName)

fileList = os.listdir(f"./{ProblemNum}")

for fileName in fileList:
    copyfile(f"./{ProblemNum}/{fileName}", f"./{fileName}")

for _ in range(1, JudgeFileNum):
    os.rename(f"./{_}.inp", f"./{ExeName}.inp") #  _.inp to Change ExeName.inp

    startTime = time.time()
    os.system(f"./{ExeName}")
    endTime = time.time()

    Time = endTime - startTime
    if(Time >= 1):
        print(f"{_} is Time out")
        continue

    print("Execute Time : %5f.s" %(Time), end = "     ")

    os.rename(f"{ExeName}.out", f"./{ExeName}.out")

    with open(f"./{ExeName}.out", 'r') as Question: # dish.out (Question)
        QuestionDiff = [Temp.strip() for Temp in Question.read().splitlines()]
    with open(f"./{_}.out", 'r') as Answer: # 1.out(Answer)
        AnswerDiff = [Temp.strip() for Temp in Answer.read().splitlines()]

    QuestionCheck = True # Right or Wrong Check

    if(len(AnswerDiff) != len(QuestionDiff)): # diff Len is Wrong Answer
        print(f"{_} is Different File Format")
        QuestionCheck = False
        continue
    
    for i in range(0, len(AnswerDiff)):
        if(AnswerDiff[i] != QuestionDiff[i]): # diff Contents is Wrong Answer
            QuestionCheck = False
            print(f"{_} is Wrong Answer")
            break
    
    if QuestionCheck:
        print(f"{_} is Perfect Credit")

    os.remove(str(_) +".out")

os.remove(str(ExeName)+".inp")
os.remove(str(ExeName)+".out")
os.remove(str(ExeName))
