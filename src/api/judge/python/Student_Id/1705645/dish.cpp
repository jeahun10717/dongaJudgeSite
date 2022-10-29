#include <iostream>
#include <stdio.h>
#include<cstdio>

using namespace std;

int main(void) {

	FILE *fp1, *fp2;
	fp1 = fopen("dish.inp", "r");
	// fp2 = fopen("dish.out", "w");

	char di[50];
	int result = 10;
	
	int N;
	int num;
	fscanf(fp1, "%d", &N);

	for (int i = 0; i < N; i++) {
		fscanf(fp1, "%d", &num);
		fscanf(fp1, "%s", di);
		for (int i = 1; i < num; i++)
		{
			if ((di[i - 1] == '(' && di[i] == ')') || (di[i - 1] == ')' && di[i] == '('))
			{
				result += 10;
			}
			else if ((di[i - 1] == '(' && di[i] == '(') || (di[i - 1] == ')' &&di[i] == ')')) {
				result += 5;
			}
		}

		fprintf(fp2, "%d\n", result);
		result = 10;
	}

	int cnt = 0;

	for (long long i = 0; i < 1000000000; i++)
	{
		cnt ++;
		cnt --;
	}
	
	
	
	fclose(fp1);
	// fclose(fp2);

	return 0;
}
