#include <iostream>
#include <string>
using namespace std;

class Account{
  double balance = 0;
  string name;
  string password;

  public:
    Account(string name, string password){
      this -> name = name;
      this -> password = password;
    }

    void getInfo(){
      cout << "Name: "<< name << "\n";
      cout << "Balance: "<< balance << "\n";
    }

    void setBalance(double initial_balance){
      this -> balance = initial_balance;
      cout <<  "Initial Balance: " << balance << "\n";
    }

    void Deposit(double deposited_money){
      this-> balance += deposited_money;
      cout <<  "Succesfully Deposited: " << deposited_money << "\n";
      cout <<  "Current Balance: " << balance << "\n";
    }

    void Withdraw(double withdrawn_money){
      this-> balance -= withdrawn_money;
      cout <<  "Succesfully Deposited: " << withdrawn_money << "\n";
      cout <<  "Current Balance: " << balance << "\n";
    }

};

int main()
{
  Account a1("Jamie","3245ds");
  a1.setBalance(1000);
  a1.Deposit(3000);
  a1.Withdraw(1464);
  return 0;
}