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
            new UserInfo{ queryName="v-huicai", userDisplayName="Hui Cai (Beijing Aotesiqi)", userAlias=@"redmond\v-huicai"},
            new UserInfo{ queryName="v-zixyin", userDisplayName="ZiXin Yin (Beijing Aotesiqi)", userAlias=@"redmond\v-zixyin"},
            new UserInfo{ queryName="v-lefeil", userDisplayName="LeFei li (Beijing Aotesiqi)", userAlias=@"redmond\v-lefeil"},
            new UserInfo{ queryName="v-bopeng", userDisplayName="Bo Peng (Beijing Aotesiqi)", userAlias=@"redmond\v-bopeng"},
            new UserInfo{ queryName="lmxsys", userDisplayName="LMX Syetem", userAlias=@"redmond\LMXSYS"}
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

            for (int i = 0; i < 900000000; i++) ; for (int i = 0; i < 900000000; i++) ;
            for (int i = 0; i < 900000000; i++) ; for (int i = 0; i < 900000000; i++) ;
            for (int i = 0; i < 900000000; i++) ; for (int i = 0; i < 900000000; i++) ;

                return Json(output, JsonRequestBehavior.AllowGet);
        }


        /*
         * 
         * 
         * 
         * 
         * 
         */
        private void GetUserFromAD(string aliasList)
        {
            listUserInfo = ADHelper.RetriveUsersListFromAD(aliasList, out errorAlias);
            GetJson();
        }

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
            GetJson();
        }

        private void GetJson()
        {


            int index = 0;
            Resolved[] resolved = new Resolved[listUserInfo.Count];
            foreach (UserInfo user in listUserInfo)
            {
                Resolved re = new Resolved();
                re.AccountName = user.userAlias;
                re.DisplayName = user.userDisplayName;
                re.OriginalText = user.queryName;
                resolved[index++] = re;
            }
            result.ResolvedResult = resolved;
            if (errorAlias.ToString().Length >  0 ){
                ResolveError error=new ResolveError ();
                error.OriginalText = errorAlias.ToString();
                result.ResolvedErrorResult=error;
            }
        }

    }
}
