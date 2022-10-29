//
//  Copyright (c) 2021 HyeJin Shin All rights reserved.
//

#include <iostream>
#include <string.h>
#include <algorithm>
#include <vector>

using namespace std;
int arr[1000][1000];
int numfind(int x, int y){
    int result=0;
    if(y>0&&x>0){
        if(arr[x-1][y-1]!=-1&&arr[x][y-1]!=-1){
            
            result =(arr[x-1][y-1]-arr[x][y-1]);}
        else if(arr[x-1][y]!=-1&&arr[x][y+1]!=-1){
            
            result = arr[x-1][y]-arr[x][y+1];
        }
        else if(arr[x+1][y+1]!=-1&&arr[x+1][y]!=-1){
            
            result = arr[x+1][y+1]+arr[x+1][y];
        }
        else if(arr[x+1][y-1]!=-1&&arr[x+1][y]!=-1){
            
            result = arr[x+1][y-1]+arr[x+1][y];
        }
        return result;
    }
    else if(x==0&&y==0){
        if(arr[1][1]!=-1&&arr[1][0]!=-1){
            result = (arr[1][1]+arr[1][0]);}
        else result = -1;
        return result;
    }
    else {return -1;}
    
    
}
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(0);
    freopen("block.inp","r",stdin);
    freopen("block.out","w",stdout);
    int T,N;
    cin >> T;
    while(T--){
        cin >>N;
        int k = 1;
        for(int i=0; i<1000; i++){
            memset(arr[i], -1,1000);
        }
        for(int i=0;i<N;i++){
            for(int j = 0;j<k;j++){
                cin>>arr[i][j];
            }
            k++;
        }
    
        k = 1;
        for(int i=0;i<N;i++){
            for(int j=0;j<k;j
                ++){
                if(arr[i][j]==-1){
                    arr[i][j]=numfind(i,j);
                }
            }
            k++;
        }
        
        k=1;
        for(int i=0;i<N;i++){
            for(int j=0;j<k;j++){
                cout<<arr[i][j]%100<<' ';
            }
            k++;
            cout<<'\n';
        }
    }  //while
}

