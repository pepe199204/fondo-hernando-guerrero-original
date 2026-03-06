
// NOTE: this file implements both the seamonkey nsICmdLineHandler and
// the toolkit nsICommandLineHandler, using runtime detection.

const SPLASH_CMDLINE_CONTRACTID    = "@mozilla.org/commandlinehandler/general-startup;1?type=splash";
const SPLASH_CMDLINE_CLSID         = Components.ID('{924217E9-F8FE-4B92-B8E1-F781D4ABB31E}');
const CATMAN_CONTRACTID            = "@mozilla.org/categorymanager;1";
const nsISupports                  = Components.interfaces.nsISupports;

const nsICategoryManager           = Components.interfaces.nsICategoryManager;
const nsICmdLineHandler            = Components.interfaces.nsICmdLineHandler;
const nsICommandLine               = Components.interfaces.nsICommandLine;
const nsICommandLineHandler        = Components.interfaces.nsICommandLineHandler;
const nsIComponentRegistrar        = Components.interfaces.nsIComponentRegistrar;
const nsISupportsString            = Components.interfaces.nsISupportsString;
const nsIWindowWatcher             = Components.interfaces.nsIWindowWatcher;

function SplashCmdLineHandler() {}

SplashCmdLineHandler.prototype = {
  firstTime: true,
  
  /* nsISupports */
  QueryInterface : function handler_QI(iid) {
    if (iid.equals(nsISupports))
      return this;

    if (nsICmdLineHandler && iid.equals(nsICmdLineHandler))
      return this;

    if (nsICommandLineHandler && iid.equals(nsICommandLineHandler))
      return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  /* nsICmdLineHandler */
  commandLineArgument : "",
  chromeUrlForTask : "chrome://splash/content/splash.xul",
  helpText : "Start with Splash.",
  handlesArgs : true,
  defaultArgs : "",
  openWindowWithArgs : true,

  /* nsICommandLineHandler */
  handle : function handler_handle(cmdLine) {
  
    if (this.firstTime) {
      var prefService = Components.classes["@mozilla.org/preferences-service;1"].
                          getService(Components.interfaces.nsIPrefBranch);

      var isEnabled = prefService.getBoolPref("splash.soundEnabled")
      var soundURL = prefService.getComplexValue("splash.soundURL", Components.interfaces.nsISupportsString).data;

      if (soundURL && isEnabled) {
        var gSound = Components.classes["@mozilla.org/sound;1"].
                   createInstance(Components.interfaces.nsISound);

        gSound.init();

        var ioService = Components.classes["@mozilla.org/network/io-service;1"].
                          getService(Components.interfaces.nsIIOService);
        var url = ioService.newURI(soundURL, null, null);
        
        gSound.play(url);
      }

      var args = null;
  
      var wwatch = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                             .getService(nsIWindowWatcher);
                             
      var myModal = "modal=" + (prefService.getBoolPref("splash.closeWithMainWindow") ? "no" : "yes")

      wwatch.openWindow(null, this.chromeUrlForTask, "_blank",
                        "chrome,centerscreen,alwaysRaised=yes,titlebar=no," + myModal, args);
      this.firstTime = false;
    }
  },

  helpInfo : "  Splash \n"
};


var SplashCmdLineFactory = {
  createInstance : function(outer, iid) {
    if (outer != null) {
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    }

    return new SplashCmdLineHandler().QueryInterface(iid);
  }
};


var SplashCmdLineModule = {
  registerSelf: function(compMgr, fileSpec, location, type) {
    compMgr = compMgr.QueryInterface(nsIComponentRegistrar);

    compMgr.registerFactoryLocation(SPLASH_CMDLINE_CLSID,
                                    "Splash CommandLine Service",
                                    SPLASH_CMDLINE_CONTRACTID,
                                    fileSpec,
                                    location,
                                    type);

    var catman = Components.classes[CATMAN_CONTRACTID].getService(nsICategoryManager);
    catman.addCategoryEntry("command-line-argument-handlers",
                            "splash command line handler",
                            SPLASH_CMDLINE_CONTRACTID, true, true);
    catman.addCategoryEntry("command-line-handler",
                            "m-splash",
                            SPLASH_CMDLINE_CONTRACTID, true, true);
  },

  unregisterSelf: function(compMgr, fileSpec, location) {
    compMgr = compMgr.QueryInterface(nsIComponentRegistrar);

    compMgr.unregisterFactoryLocation(SPLASH_CMDLINE_CLSID, fileSpec);
    catman = Components.classes[CATMAN_CONTRACTID].getService(nsICategoryManager);
    catman.deleteCategoryEntry("command-line-argument-handlers",
                               "splash command line handler", true);
    catman.deleteCategoryEntry("command-line-handler",
                               "m-splash", true);
  },

  getClassObject: function(compMgr, cid, iid) {
    if (cid.equals(SPLASH_CMDLINE_CLSID)) {
      return SplashCmdLineFactory;
    }

    if (!iid.equals(Components.interfaces.nsIFactory)) {
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
    }

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function(compMgr) {
    return true;
  }
};


function NSGetModule(compMgr, fileSpec) {
  return SplashCmdLineModule;
}
