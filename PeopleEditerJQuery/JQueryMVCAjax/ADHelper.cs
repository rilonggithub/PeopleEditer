using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.DirectoryServices;
using System.DirectoryServices.ActiveDirectory;
using System.DirectoryServices.AccountManagement;


namespace LMXCommonTool
{
    public class ADHelper
    {
        private static string[] strDomains = new string[] { "Redmond", "Africa", "Europe", "FarEast", "MiddleEast", "NorthAmerica", "SouthAmerica", "SouthPacific", "Sys-WinGroup" };
        private enum SearchType
        {
            byAccount,//like v-lianl;
            byDisplayname//like Liang Liu(Beijing Aotesiqi);
        }

        private static List<string> SpiteUsersList(string inputUserList)
        {
            List<string> retList = new List<string>();
            string[] Users = inputUserList.Split(new char[] { ';' });
            foreach (string item in Users)
            {
                if (!string.IsNullOrEmpty(item))
                {
                    retList.Add(item);
                }
            }
            return retList;
        }

        public static List<UserInfo> RetriveUsersListFromAD(string stringInputUsers,out StringBuilder errorAlias)
        {
            errorAlias = new StringBuilder ();
            List<UserInfo> retList = new List<UserInfo>();
            List<string> users = SpiteUsersList(stringInputUsers);
            foreach (string item in users)
            {
                try
                {
                    retList.Add(RetriveUserFromAD(item));
                }
                catch { errorAlias.Append(item+";"); }
            }
            return retList;
        }
        public static string RetriveUsersFromAD(string stringInputUsers)
        {
            StringBuilder success = new StringBuilder();
            StringBuilder failed = new StringBuilder();
            UserInfo ui;

            List<string> users = SpiteUsersList(stringInputUsers);
            foreach (string item in users)
            {
                if (!string.IsNullOrEmpty(item.Trim()))
                {
                    ui = RetriveUserFromAD(item);

                    if (ui.IsInAD)
                    {
                        if (!success.ToString().Contains(ui.userDisplayName))
                            success.Append(ui.userDisplayName + ";");
                    }
                    else
                    {
                        if (!failed.ToString().Contains(ui.queryName))
                        {
                            failed.Append(ui.queryName + ";");
                        }
                    }
                }
            }

            return success.ToString() + "ADErrors at : " + failed.ToString();
        }

        public static string RetriveUsersFromADSuccess(string stringInputUsers)
        {
            StringBuilder success = new StringBuilder();
            StringBuilder failed = new StringBuilder();
            UserInfo ui;

            List<string> users = SpiteUsersList(stringInputUsers);
            foreach (string item in users)
            {
                if (!string.IsNullOrEmpty(item.Trim()))
                {
                    ui = RetriveUserFromAD(item);

                    if (ui.IsInAD)
                    {
                        if (!success.ToString().Contains(ui.userDisplayName))
                            success.Append(ui.userDisplayName + ";");
                    }
                    else
                    {
                        if (!failed.ToString().Contains(ui.queryName))
                        {
                            failed.Append(ui.queryName + ";");
                        }
                    }
                }
            }

            return success.ToString() + failed.ToString();
        }

        public static List<string> RetriveUserMailsFromAD(string stringInputUsers)
        {
            StringBuilder retString = new StringBuilder();
            UserInfo ui;

            List<string> users = SpiteUsersList(stringInputUsers);
            List<string> mailsList = new List<string>();
            foreach (string item in users)
            {
                ui = RetriveUserFromAD(item);
                if (ui.IsInAD)
                {
                    mailsList.Add(ui.userEmail);
                }
            }

            return mailsList;
        }

        public static List<string> RetriveUserMailsFromAD(List<string> users)
        {
            StringBuilder retString = new StringBuilder();
            UserInfo ui;

            List<string> mailsList = new List<string>();
            foreach (string item in users)
            {
                ui = RetriveUserFromAD(item);
                if (ui.IsInAD)
                {
                    mailsList.Add(ui.userEmail);
                }
            }

            return mailsList;
        }

        private static UserInfo RetriveUserFromAD(string inputUser)
        {
            if (GetSearchType(inputUser) == SearchType.byAccount)
            {
                return CheckNameByAccount(inputUser);
            }
            else
                return CheckNameByDisplayName(inputUser);
        }

        private static SearchType GetSearchType(string strName)
        {
            if (strName.IndexOf("\\") > -1)
                return SearchType.byAccount;
            else
                return SearchType.byDisplayname;
        }

        private static UserInfo CheckNameByAccount(string userName)
        {
            UserInfo ui = new UserInfo();
            try
            {
                string domain = GetDomain(userName);
                string loginName = GetLoginName(userName);
                string domainPath = GetDomainPath(domain);
                DirectoryEntry de = new DirectoryEntry(domainPath);
                DirectorySearcher deSearch = new DirectorySearcher();
                deSearch.SearchRoot = de;
                deSearch.Filter = "(&(objectClass=user)(objectCategory=person)(samaccountname=" + loginName + "))";
                SearchResult results = deSearch.FindOne();
                if (results != null)
                {
                    ui.userAlias = domain + "\\" + results.Properties["samaccountname"][0].ToString();
                    ui.userDisplayName = results.Properties["displayname"][0].ToString();
                    ui.userEmail = results.Properties["mail"][0].ToString();
                    ui.queryName = userName;
                    ui.IsInAD = true;
                }
            }
            catch (Exception)
            {
                //Catch Incorrect Domain name
            }            
            ui.queryName = userName;
            return ui;
        }

        private static string GetDomain(string userName)
        {
            string strDomain = string.Empty;
            strDomain = userName.Split('\\')[0];
            DirectoryContext objContext = new DirectoryContext(DirectoryContextType.Domain, strDomain, @"Redmond\lmxsys", "0p;/)P:?");
            string domain = Domain.GetDomain(objContext).Name;
            return domain;
        }

        private static string GetLoginName(string userName)
        {
            string strLoginName = string.Empty;
            strLoginName = userName.Split('\\')[1];
            return strLoginName;
        }

        private static string GetDomainPath(string domain)
        {
            return "LDAP://" + domain;
        }
        private static UserInfo CheckNameByDisplayName(string userName)
        {
            userName = userName.Trim();
            UserInfo ui = new UserInfo();
            string domainPath = string.Empty;

            foreach (string domain in strDomains)
            {
                domainPath = GetDomainPath(domain);
                DirectoryEntry de = new DirectoryEntry(domainPath, "lmxsys", "qwe123!@#");
                DirectorySearcher deSearch = new DirectorySearcher();
                deSearch.SearchRoot = de;
                deSearch.Filter = "(&(objectClass=user)(objectCategory=person)(samaccountname=" + userName + "))";
                SearchResult results = deSearch.FindOne();

                if (results != null)
                {
                    ui.userAlias = domain + "\\" +   results.Properties["samaccountname"][0].ToString();
                    ui.userDisplayName = results.Properties["displayname"][0].ToString();
                    ui.userEmail = results.Properties["mail"][0].ToString();
                    ui.queryName = userName;
                    ui.IsInAD = true;
                    break;
                }
                else
                {
                    ui.queryName = userName;
                }
            }
            return ui;
        }

        public static bool CheckUserInGroup(string strUserName,string strGroupName)
        {
            bool check = false;
           
            foreach (string domain in strDomains)
            {
               // domainPath = GetDomainPath(domain);
                try
                {
                    using (var pc = new PrincipalContext(ContextType.Domain, domain))
                    using (var user = UserPrincipal.FindByIdentity(pc, IdentityType.SamAccountName, strUserName))
                    // using (var group = GroupPrincipal.FindByIdentity(pc, "MOD PMG Updates"))
                    using (var group = GroupPrincipal.FindByIdentity(pc, strGroupName))
                    {
                        check = user.IsMemberOf(group);
                        if (check)
                            break;
                    }
                }
                catch (Exception e)
                { 
                  
                }
            }
            return check;
          
        }
    }
}
