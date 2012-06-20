using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Text;
using System.Web.Mvc;
using LMXCommonTool;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using Newtonsoft.Json;

namespace JQueryMVCAjax.Controllers
{
    public class CheckAliasController : Controller
    {
        //
        // GET: /CheckAlias/
        
        private StringBuilder errorAlias =new StringBuilder ();
        private List<UserInfo> SampleData = new List<UserInfo> { 
            new UserInfo{ queryName="v-huicai", userDisplayName="Hui Cai (Beijing Aotesiqi)", userAlias=@"redmond\v-huicai", Type="User"},
            new UserInfo{ queryName="v-zixyin", userDisplayName="ZiXin Yin (Beijing Aotesiqi)", userAlias=@"redmond\v-zixyin",Type="User"},
            new UserInfo{ queryName="v-lefeil", userDisplayName="LeFei li (Beijing Aotesiqi)", userAlias=@"redmond\v-lefeil",Type="User"},
            new UserInfo{ queryName="v-bopeng", userDisplayName="Bo Peng (New York Aotesiqi)", userAlias=@"redmond\v-bopeng",Type="User"},
            new UserInfo{ queryName="v-bopeng", userDisplayName="Bo Peng (Beijing Aotesiqi)", userAlias=@"fareast\v-bopeng",Type="User"},
            new UserInfo{ queryName="lmxsys", userDisplayName="LMX System", userAlias=@"redmond\LMXSYS",Type="Group"},
            new UserInfo{ queryName="lmxsys", userDisplayName="LMX System (New York Aotesiqi)", userAlias=@"fareast\LMXSYS",Type="User"}
        };
        List<UserInfo> listUserInfo = new List<UserInfo>();
        private ResolveResult result = new ResolveResult();
        private string[] aliasArray;
        public JsonResult Index(string aliasList)
        {
            string output;
            try
            {
                GetUserFromSampleData(aliasList);
                output = JsonConvert.SerializeObject(result);
            }
            catch (Exception e)
            {
                output = e.StackTrace;
            }

            //for (int i = 0; i < 900000000; i++) ; 

              return Json(output, JsonRequestBehavior.AllowGet);
        }


        /*
         * 
         * 
         * 从AD域里获取数据
         * 
         * 
         */
        private void GetUserFromAD(string aliasList)
        {
            listUserInfo = ADHelper.RetriveUsersListFromAD(aliasList, out errorAlias);
            ResolveData();
        }


        /* 获取用例数据*/
        private void GetUserFromSampleData(string aliasList)
        {
            
            bool IsResolve = false;
            aliasArray = aliasList.Split(';');
            foreach (string alias in aliasArray)
            {
                foreach (UserInfo user in SampleData)
                {
                    if (alias.ToLower().Trim().Equals(user.queryName))
                    {
                        listUserInfo.Add(user);
                        IsResolve = true;
                    }
                }
                if (IsResolve == false)
                {
                    errorAlias.Append(alias + ";");
                    IsResolve = false;
                }
                IsResolve = false;

            }
            ResolveData();
        }

        /*    根据alias  在已经出现过的Alias数组里面查找， 如果这个alias以前出现过，就返回true,
         *     并带回以前该Alias在数组里面的下标， 否则就返回false
         */
        private bool IsContainsAlias(Resolved[] resolved, string alias,out int resolvedIndex)
        {
            resolvedIndex=0;
            try
            {
                for (int i = 0; i < resolved.Length; i++)
                {
                    for (int j = 0; j < resolved[i].OriginalText.Count; j++)
                    {
                        if (resolved[i].OriginalText[j].Equals(alias))
                        {
                            resolvedIndex = i;
                            return true;
                        }
                    }
                }
            }
            catch (Exception e)
            {
            }
            return false;
        }

        /* 解析得到的数据，准备转换为JSON*/
        private void ResolveData()
        {

            int resolvedIndex=0;
            int index = 0;
            Resolved[] resolved = new Resolved[listUserInfo.Count];
            foreach (UserInfo user in listUserInfo)
            {
                /* 如果该alias以前出现过并且index > 0， 那就在以前的Alias的基础上，将该alias的信息添加到原来的Alias里面，
                    因为 alias的信息都是以List<string>的形式存储的*/
                if (index >0 && IsContainsAlias(resolved, user.queryName, out  resolvedIndex))
                {
                    resolved[resolvedIndex].AccountName.Add(user.userAlias);
                    resolved[resolvedIndex].DisplayName.Add(user.userDisplayName);
                    resolved[resolvedIndex].OriginalText.Add(user.queryName);
                    resolved[resolvedIndex].Type.Add(user.Type);
                }
                /* 如果该alias以前没有出现过， 就重新分配一个存储alias信息的空间 。*/
                else 
                {
                    Resolved re = new Resolved();
                    re.AccountName =new List<string>() {(user.userAlias)};
                    re.DisplayName= new List<string>() {(user.userDisplayName)};
                    re.OriginalText =new List<string>() {(user.queryName)};
                    re.Type =new List<string>() {(user.Type)};
                    resolved[index++] = re;
                }
            }
            result.ResolvedResult = resolved;   /* 这是已经得到的解析好的alias的数组*/

            /*  得到处理出错的Alias的信息*/
            if (errorAlias.ToString().Length >  0 ){
                ResolveError error=new ResolveError ();
                error.OriginalText = errorAlias.ToString();
                result.ResolvedErrorResult=error;
            }
        }

    }
}
