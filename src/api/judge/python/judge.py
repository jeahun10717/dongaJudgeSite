import os
import time
import sys
from shutil import copyfile

# Change Area
Arg = sys.argv

FileName = Arg[1] + ".cpp"
ExeName = Arg[1]
ProblemNum = Arg[2]
Student_Id = Arg[3]

# print (os.getcwd())

os.chdir("./src/api/judge/python")

fileList = os.listdir("./Problems/{}".format(ProblemNum))

JudgeFileNum = int(len(fileList)/ 2 + 1)

for fileName in fileList:
    copyfile("./Problems/{}/{}".format(ProblemNum, fileName),
             "./Student_Id/{}/{}".format(Student_Id, fileName))

os.chdir("./Student_Id/{}".format(Student_Id))

os.system("g++ " + FileName + " -o " + ExeName)

for _ in range(1, JudgeFileNum):
    # _.inp to Change ExeName.inp
    os.rename("./{}.inp".format(_), "./{}.inp".format(ExeName))

    startTime = time.time()
    os.system("./{}".format(ExeName))
    endTime = time.time()

    Time = endTime - startTime
    if(Time >= 1):
        print("{},0,{:.5f},Timeout".format(_, Time))
        continue

    with open("./{}.out".format(ExeName), 'r') as Question:  # dish.out (Question)
        QuestionDiff = [Temp.strip() for Temp in Question.read().splitlines()]
    with open("./{}.out".format(_), 'r') as Answer:  # 1.out(Answer)
        AnswerDiff = [Temp.strip() for Temp in Answer.read().splitlines()]

    QuestionCheck = True  # Right or Wrong Check

    if(len(AnswerDiff) != len(QuestionDiff)):  # diff Len is Wrong Answer
        print("{},0,{:.5f},Different File Format".format(_, Time))
        QuestionCheck = False
        continue

    for i in range(0, len(AnswerDiff)):
        if(AnswerDiff[i] != QuestionDiff[i]):  # diff Contents is Wrong Answer
            QuestionCheck = False
            print("{},0,{:.5f},Wrong Answer".format(_, Time))
            break

    if QuestionCheck:
        print("{},10,{:.5f},Perfect Credit".format(_, Time))

    os.remove(str(_) + ".out")

os.remove(str(ExeName)+".inp")
os.remove(str(ExeName)+".out")
os.remove(str(ExeName))
