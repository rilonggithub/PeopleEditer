using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace LMXCommonTool
{
    public class UserInfo
    {
        /// <summary>
        /// like redmond\v-lefeil
        /// </summary>
        public string userAlias{get;set;}
        /// <summary>
        /// like Lefei Li (Beijing Aotesiqi)
        /// </summary>
        public string userDisplayName { get; set; } 
        /// <summary>
        /// like v-lefeil@microsoft.com
        /// </summary>
        public string userEmail {get;set;}
        /// <summary>
        /// the value you requested to check in AD
        /// </summary>
        public string queryName { get; set; }
        /// <summary>
        /// whether it's found in AD
        /// </summary>
        public bool IsInAD { get; set; }
        public string Type { get; set; }
        public UserInfo()
        {
            userAlias = string.Empty;
            userDisplayName = string.Empty;
            userEmail = string.Empty;
            queryName = string.Empty;
            IsInAD = false;
        }
    }


    public class Resolved
    {
        public string DisplayName { get; set; }
        public string OriginalText { get; set; }
        public string AccountName { get; set; }
        public string Type { get; set; }
    }

    public class ResolveError
    {
        public string OriginalText{get;set;}
    }

    public class ResolveResult  
    {
        public Resolved[] ResolvedResult { set; get; }
        public ResolveError ResolvedErrorResult { get; set; }
    }
}
