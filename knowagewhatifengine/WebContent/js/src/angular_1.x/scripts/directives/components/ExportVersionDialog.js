/*
 * Knowage, Open Source Business Intelligence suite
 * Copyright (C) 2016 Engineering Ingegneria Informatica S.p.A.
 *
 * Knowage is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Knowage is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
(function() {
	var scripts = document.getElementsByTagName("script");
	var currentScriptPath = scripts[scripts.length - 1].src;
	currentScriptPath = currentScriptPath.substring(0, currentScriptPath.lastIndexOf('/') + 1);
	var contextBasePath = currentScriptPath + '../../../../../';
//  					/knowagewhatifengine/js/src/angular_1.x/scripts/directives/components/ExportVersionDialog.js

var app = angular.module('export_version_dialogs',[]);

app.directive('exportVersionWizard',
	function(){
	return {
	      restrict: 'E',
	      replace: true,
//	      templateUrl: '/knowagewhatifengine/html/template/right/export/exportWizard.html'
	      templateUrl: contextBasePath + 'html/template/right/export/exportWizard.html'
	  };
	}
)

app.directive('exportVersionFileWizard', 
	function(){
		return{
			restrict:'E',
			replace:true,
//			templateUrl: '/knowagewhatifengine/html/template/right/export/exportWizardFile.html'
			templateUrl: contextBasePath + 'html/template/right/export/exportWizardFile.html'
		};
	}
)

app.directive('exportVersionTableWizard', 
	function(){
		return{
			restrict:'E',
			replace:true,
//			templateUrl: '/knowagewhatifengine/html/template/right/export/exportWizardTable.html'
			templateUrl: contextBasePath + 'html/template/right/export/exportWizardTable.html'
		};
	}
)

app.directive('exportVersionMsg', 
	function(){
		return{
			restrict:'E',
			replace:true,
//			templateUrl: '/knowagewhatifengine/html/template/right/export/exportWizardMessage.html'
			templateUrl: contextBasePath + 'html/template/right/export/exportWizardMessage.html'
		};
	}
)
})();