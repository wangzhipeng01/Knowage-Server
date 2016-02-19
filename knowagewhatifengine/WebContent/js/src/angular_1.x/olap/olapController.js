var olapMod = angular.module('olapManager', [ 'sbiModule','ngMaterial', 'ngSanitize','ngDraggable'])
.directive('compileTemplate', function($compile, $parse){
    return {
        link: function(scope, element, attr){
            var parsed = $parse(attr.ngBindHtml);
            function getStringValue() { return (parsed(scope) || '').toString(); }
            
            //Recompile if the template changes
            scope.$watch(getStringValue, function() {
                $compile(element, null,-9999)(scope);  //The -9999 makes it skip directives so that we do not recompile ourselves
            });
        }         
    }
});

olapMod.directive('scrolly', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var raw = element[0];
            console.log('loading directive');
                
            element.bind('scroll', function () {
                
                console.log(raw.scrollTop );
    var pos = Math.round(raw.scrollTop/100);
    scope.startFrom(pos);
                
               
            });
        }
    };
});

olapMod.controller("olapController", ["$scope", "$timeout", "$window","$mdDialog", "$http",'$sce','$mdToast'                                    
,'sbiModule_messaging','sbiModule_restServices',olapFunction ]);

function olapFunction($scope, $timeout, $window, $mdDialog, $http, $sce,$mdToast,sbiModule_messaging,sbiModule_restServices) {
	
	templateRoot = "/knowagewhatifengine/html/template";
	$scope.templateList = templateRoot + '/main/filter/treeFirstLevel.html';
	$scope.templateListChild = templateRoot + '/main/filter/treeDeeperLevels.html';
	$scope.filterCard = templateRoot + '/main/filter/filterCard.html';
	$scope.filterPanel = templateRoot + '/main/filter/filterPanel.html';
	$scope.mainToolbar = templateRoot + '/main/toolbar/mainToolbar.html';
	$scope.olapPanel = templateRoot + '/main/olap/olapPanel.html';
	$scope.topToolbar = templateRoot + '/main/olap/topToolbar.html';
	$scope.leftToolbarPlusMain = templateRoot + '/main/olap/leftToolbarPlusMain.html';

	$scope.leftPanel = templateRoot + '/left/leftPanel.html';
	$scope.rightPanel = templateRoot + '/right/rightPanel.html';
	
	$scope.rows;
	$scope.maxRows = 3;
	$scope.topSliderNeeded;
	$scope.topStart = 0;
	
	$scope.columns;
	$scope.maxCols = 5;
	$scope.leftSliderNeeded;
	$scope.leftStart = 0;
	
	$scope.toolbarButtons = [];
	$scope.filterCardList = [];
	$scope.showMdxVar = "";

	$scope.draggedFrom = "";
	$scope.dragIndex;
	
	$scope.doneonce =false;
	$scope.level;
	$scope.data=[];
	$scope.loadedData = [];
	$scope.dataPointers = [];
	$scope.numVisibleFilters = 5;
	$scope.shiftNeeded;
	
	$scope.modelConfig;
	
	$scope.ready = true;
	
	$scope.changeDrillType = function(type){
		$scope.modelConfig.drillType = type;
		console.log($scope.modelConfig.drillType);
		$scope.sendModelConfig($scope.modelConfig);
	}
	
	$scope.btnFunctions = function(name){
		switch(name){
		case "BUTTON_FATHER_MEMBERS":
			$scope.modelConfig.showParentMembers = !$scope.modelConfig.showParentMembers;
			console.log($scope.modelConfig.showParentMembers);
			break;
		case "BUTTON_HIDE_SPANS":
			$scope.modelConfig.hideSpans = !$scope.modelConfig.hideSpans;
			console.log($scope.modelConfig.hideSpans);
			break;
		case "BUTTON_SHOW_PROPERTIES":
			$scope.modelConfig.showProperties = !$scope.modelConfig.showProperties;
			console.log($scope.modelConfig.showProperties);
			break;
		case "BUTTON_HIDE_EMPTY":
			$scope.modelConfig.suppressEmpty = !$scope.modelConfig.suppressEmpty;
			console.log($scope.modelConfig.suppressEmpty);
			break;	
		default:
			console.log("something else clicked");
		}
		$scope.sendModelConfig($scope.modelConfig);
	}
	
	/*dragan**/
	 
	 /*service for placing member on axis**/
	 $scope.putMemberOnAxis = function(fromAxis,member){
		 
		 sbiModule_restServices.promisePost
		 ('1.0/axis/'+fromAxis+'/moveDimensionToOtherAxis/'+member.uniqueName+'/'+member.axis+'?SBI_EXECUTION_ID='+JSsbiExecutionID,"",member)
			.then(function(response) {
				$scope.table = $sce.trustAsHtml(response.data.table);
				$scope.modelConfig = response.data.modelConfig;
				console.log($scope.modelConfig);
				
			}, function(response) {
				sbiModule_messaging.showErrorMessage("Error", 'Error');
				
			});	
	}
	 
	 /*dragan**/
	 
	 /*service for moving hierarchies**/
	 $scope.moveHierarchies = function(axis,hierarchieUniqeName,newPosition,direction){
		 
		 sbiModule_restServices.promisePost
		 ('1.0/axis/'+axis+'/moveHierarchies/'+hierarchieUniqeName+'/'+newPosition+'/'+direction+'?SBI_EXECUTION_ID='+JSsbiExecutionID,"",member)
			.then(function(response) {
				$scope.table = $sce.trustAsHtml(response.data.table);
				$scope.modelConfig = response.data.modelConfig;
				console.log($scope.modelConfig);
				
			}, function(response) {
				sbiModule_messaging.showErrorMessage("Error", 'Error');
				
			});	
	}
	
	/*dragan**/
	 
	 /*service for sending modelConfig**/
	 
	 $scope.sendModelConfig = function(modelConfig){
		 
		 sbiModule_restServices.promisePost
		 ("1.0/modelconfig?SBI_EXECUTION_ID="+JSsbiExecutionID,"",modelConfig)
			.then(function(response) {
				$scope.table = $sce.trustAsHtml(response.data.table);
				$scope.modelConfig = response.data.modelConfig;
				console.log($scope.modelConfig);
				
			}, function(response) {
				sbiModule_messaging.showErrorMessage("Error", 'Error');
				
			});	
	}
	/**dragan*/
	 $scope.startFrom = function(start){
		   if($scope.ready){
		    $scope.ready = false;
		    
		    sbiModule_restServices.promiseGet("1.0",'/member/start/1/'+start+'?SBI_EXECUTION_ID='+JSsbiExecutionID)
			.then(function(response) {
				$scope.table = $sce.trustAsHtml( response.data.table);
				   $scope.ready = true;
				   $scope.rows = response.data.rows;
				   $scope.columns = response.data.columns;
				   $scope.filterCardList = response.data.filters;
				   $scope.showMdxVar = response.data.mdxFormatted;
			}, function(response) {
				sbiModule_messaging.showErrorMessage("error", 'Error');
				
			});	
		   }
		  }
	 
	 $scope.sortBDESC = function(){
		 
		 sbiModule_restServices.promiseGet("1.0","/member/sort/1/0/[[Measures].[Unit Sales]]/BDESC?SBI_EXECUTION_ID="+JSsbiExecutionID)
			.then(function(response) {
				   $scope.table = $sce.trustAsHtml( response.data.table);
				   $scope.rows = response.data.rows;
				   $scope.columns = response.data.columns;
				   $scope.filterCardList = response.data.filters;
				   $scope.showMdxVar = response.data.mdxFormatted;
			}, function(response) {
				sbiModule_messaging.showErrorMessage("error", 'Error');
				
			});	
		  }
	 
	 $scope.sortBASC = function(){
		 
		 sbiModule_restServices.promiseGet("1.0","/member/sort/1/0/[[Measures].[Unit Sales]]/BASC?SBI_EXECUTION_ID="+JSsbiExecutionID)
			.then(function(response) {
				   $scope.table = $sce.trustAsHtml( response.data.table);
				   $scope.rows = response.data.rows;
				   $scope.columns = response.data.columns;
				   $scope.filterCardList = response.data.filters;
				   $scope.showMdxVar = response.data.mdxFormatted;
			}, function(response) {
				sbiModule_messaging.showErrorMessage("error", 'Error');
				
			});	
		  }

	/**dragan*/
	angular.element(document).ready(function() {
		$scope.sendMdxQuery('null');
	});

	var counter = 0;

	console.log(JSsbiExecutionID);
	
	checkShift = function(){
		$scope.shiftNeeded = $scope.filterCardList.length > $scope.numVisibleFilters ? true
				: false;
		
		$scope.topSliderNeeded = $scope.columns.length > $scope.maxCols? true : false;
		
		$scope.leftSliderNeeded = $scope.rows.length > $scope.maxRows? true : false;
	}
	
	filterXMLResult = function(res) {
		console.log(res);
		var regEx = /([A-Z]+_*)+/g;
		var i;
		
		while (i = regEx.exec(res)){
			var btn = {};
			btn.tooltip = messageResource.get("sbi.olap.toolbar."+ i[0], 'messages');
			btn.img =i[0];//"../img/show_parent_members.png"// url(../img/show_parent_members.png);
			$scope.toolbarButtons.push(btn);	
		}
			
	}

	filterXMLResult(toolbarVisibleBtns);
	
	/**
	 * Filter shift if necessary  
	 **/
	$scope.filterShift = function(direction) {
		var length = $scope.filterCardList.length;

		var first = $scope.filterCardList[0];
		var last = $scope.filterCardList[length - 1];

		if (direction == "left") {
			for (var i = 0; i < length; i++) {
				$scope.filterCardList[i] = $scope.filterCardList[i + 1];
			}

			$scope.filterCardList[length - 1] = first;
		} else {
			for (var i = length - 2; i >= 0; i--) {
				$scope.filterCardList[i + 1] = $scope.filterCardList[i];
			}
			$scope.filterCardList[0] = last;
		}

	}
	
	$scope.dimensionShift = function(direction){
		if(direction == 'left' && $scope.columns.length-1-$scope.topStart >= $scope.maxCols){
		      $scope.topStart++;      
	    }
	    if(direction == 'right' && $scope.topStart>0){
	      $scope.topStart--;
	    }
	    if(direction == 'up' && $scope.rows.length-1-$scope.leftStart >= $scope.maxRows){
	    	$scope.leftStart++;
	    }
	    if(direction == 'down' && $scope.leftStart){
	    	$scope.leftStart--;
	    }
	    
	}
	
	$scope.sendMdxQuery = function(mdx) {
		sbiModule_restServices.promisePost("1.0/model/?SBI_EXECUTION_ID="+JSsbiExecutionID,"",mdx)
		.then(function(response) {
			$scope.table = $sce.trustAsHtml(response.data.table);
			console.log($http.url);
			$scope.rows = response.data.rows;
			$scope.columns = response.data.columns;
			$scope.filterCardList = response.data.filters;
			checkShift();
			$scope.showMdxVar = response.data.mdxFormatted;
			$mdDialog.hide();
			$scope.mdxQuery = "";
			$scope.modelConfig = response.data.modelConfig;
			
		}, function(response) {
			sbiModule_messaging.showErrorMessage("Error", 'Error');
			
		});	
	}

	console.log(JSsbiExecutionID);
	
	/**
	 * Tree structure service
	 **/
	$scope.getHierarchyMembers = function(uniqueName,axis,node){
		
		sbiModule_restServices.promiseGet
		("1.0",'/hierarchy/'+ uniqueName+ '/filtertree2/'+ axis+ '?SBI_EXECUTION_ID='+ JSsbiExecutionID+ '&node='+node)
		.then(function(response) {
			  $scope.data = response.data;
			  $scope.loadedData.push(response.data);
			  $scope.dataPointers.push(uniqueName);
		}, function(response) {
			sbiModule_messaging.showErrorMessage("error", 'Error');
			
		});	
	}

	$scope.drillDown = function(axis, position, member, uniqueName,positionUniqueName) {
		sbiModule_restServices.promiseGet
		("1.0",'/member/drilldown/'+ axis+ '/'+ position+ '/'+ member+ '/'+ positionUniqueName+ '/'+ uniqueName+ '?SBI_EXECUTION_ID=' + JSsbiExecutionID)
		.then(function(response) {
			$scope.table = $sce.trustAsHtml(response.data.table);
			$scope.showMdxVar = response.data.mdxFormatted;
		}, function(response) {
			sbiModule_messaging.showErrorMessage("error", 'Error');
			
		});		
	}

	$scope.drillUp = function(axis, position, member, uniqueName,positionUniqueName) {
		sbiModule_restServices.promiseGet
		("1.0",'/member/drillup/'+ axis+ '/'+ position+ '/'+ member+ '/'+ positionUniqueName+ '/'+ uniqueName+ '?SBI_EXECUTION_ID=' + JSsbiExecutionID)
		.then(function(response) {
			$scope.table = $sce.trustAsHtml(response.data.table);
			$scope.showMdxVar = response.data.mdxFormatted;
		}, function(response) {
			sbiModule_messaging.showErrorMessage("error", 'Error');
			
		});		
	}

	$scope.swapAxis = function() {
		sbiModule_restServices.promisePost("1.0/axis/swap?SBI_EXECUTION_ID="+JSsbiExecutionID,"")
		.then(function(response) {
			var x;
			$scope.table = $sce.trustAsHtml(response.data.table);
			x = $scope.rows;
			$scope.rows = $scope.columns;
			$scope.columns = x;
			
		}, function(response) {
			sbiModule_messaging.showErrorMessage("Error", 'Error');
			
		});	
	}

	$scope.openFilters = function(ev) {
		$mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title(
				"Here goes filtering").ok("ok").targetEvent(ev));
	}

	/**
	 * Drag and drop functionalities start
	 **/	
	$scope.dropTop = function(data, ev) {
		var leftLength = $scope.rows.length;
		var topLength = $scope.columns.length;
		var fromAxis = data.axis;
		console.log("drop");
		console.log($scope.draggedFrom);
		console.log("**********data*************")
		console.log(data);
		
		if(fromAxis!=0){
			data.positionInAxis = topLength;
			data.axis = 0;

			if ($scope.draggedFrom == 'left' && leftLength == 1){
				sbiModule_messaging.showErrorMessage("Column", 'Error');

			}
				
			else {
				if ($scope.draggedFrom == 'left') {
					$scope.rows.splice($scope.dragIndex, 1);
					$scope.columns.push(data);
				}
				if ($scope.draggedFrom == 'filter') {
					$scope.filterCardList.splice($scope.dragIndex, 1);
					$scope.columns.push(data);
				}
			}
			$scope.putMemberOnAxis(fromAxis,data);
			checkShift();
			console.log($scope.columns);
		}
	}

	$scope.dropLeft = function(data, ev) {
		var leftLength = $scope.rows.length;
		var topLength = $scope.columns.length;
		var fromAxis = data.axis;
		console.log("drop");
		console.log($scope.draggedFrom);
		console.log("**********data*************")
		console.log(data);
		
		if(fromAxis != 1){
			data.positionInAxis = leftLength;
			data.axis = 1;
			
			if ($scope.draggedFrom == 'top' && topLength == 1)
				//$scope.showSimpleToast("Row");
				sbiModule_messaging.showErrorMessage("Row", 'Error');
			else {
				if ($scope.draggedFrom == 'top') {
					$scope.columns.splice($scope.dragIndex, 1);
					$scope.rows.push(data);
				}
				if ($scope.draggedFrom == 'filter') {
					$scope.filterCardList.splice($scope.dragIndex, 1);
					$scope.rows.push(data);
				}
			}

			$scope.putMemberOnAxis(fromAxis,data);
			checkShift();
			console.log($scope.rows);
		}

	}

	$scope.dropFilter = function(data, ev) {
		console.log("**********data*************")
		console.log(data);

		var leftLength = $scope.rows.length;
		var topLength = $scope.columns.length;
		var fromAxis = data.axis;
		
		if(fromAxis!=-1){
			data.positionInAxis = $scope.filterCardList.length;
			data.axis = -1;
			
			if ($scope.draggedFrom == 'left' && leftLength == 1)
				//$scope.showSimpleToast("Column");
				sbiModule_messaging.showErrorMessage("Column", 'Error');
			else if ($scope.draggedFrom == 'top' && topLength == 1)
				//$scope.showSimpleToast("Row");
				sbiModule_messaging.showErrorMessage("Row", 'Error');
			else {
				if ($scope.draggedFrom == 'top') {
					$scope.columns.splice($scope.dragIndex, 1);
					$scope.filterCardList.push(data);
				}
				if ($scope.draggedFrom == 'left') {
					$scope.rows.splice($scope.dragIndex, 1);
					$scope.filterCardList.push(data);
				}
			}

			$scope.putMemberOnAxis(fromAxis,data);
			checkShift();
		}
		
	}

	$scope.dragSuccess = function(df, index) {
		console.log("drag");
		$scope.draggedFrom = df;
		$scope.dragIndex = index;
		console.log(df);
		console.log("indeks" + index);
	}
	
	/**
	 * Dialogs  
	 **/
	$scope.openFiltersDialog = function(ev, uniqueName, axis, node) {
		var exist = false;
		var position;
		$scope.data=[];
		
		for(var i = 0; i< $scope.dataPointers.length;i++){
			if($scope.dataPointers[i] == uniqueName){
				position = i;
				exist = true;
			}
		}
		
		if(!exist)
			$scope.getHierarchyMembers(uniqueName, axis, node);
		else{
			$scope.data = $scope.loadedData[position];
		}

			$mdDialog
			.show({
				scope : $scope,
				preserveScope : true,
				controllerAs : 'olapCtrl',
				templateUrl : '/knowagewhatifengine/html/template/main/filter/filterDialog.html',
				targetEvent : ev,
				clickOutsideToClose : true
			});
		
		
	}

	$scope.openMdxQueryDialog = function(ev) {
		$mdDialog
				.show({
					scope : $scope,
					preserveScope : true,
					controllerAs : 'olapCtrl',
					templateUrl : '/knowagewhatifengine/html/template/main/toolbar/sendMdx.html',
					targetEvent : ev,
					clickOutsideToClose : true
				});
	}

	$scope.openShowMdxDialog = function(ev) {
		$mdDialog
				.show({
					scope : $scope,
					preserveScope : true,
					controllerAs : 'olapCtrl',
					templateUrl : '/knowagewhatifengine/html/template/main/toolbar/showMdx.html',
					targetEvent : ev,
					clickOutsideToClose : true
				});
	}

	$scope.closeFiltersDialog = function() {
		$mdDialog.hide();
	}
	
	
	/**
	 *Tree functionalities 
	 **/
	$scope.expandTree = function(item) {
		var id = item.id;

		for (var i = 0; i < $scope.data.length; i++) {
			if ($scope.data[i].id == id && $scope.data[i].children.length > 0) {
				$scope.data[i].collapsed = !$scope.data[i].collapsed;
				//levelDrop(id, $scope.data[i].children);
				break;
			} else {
				if ($scope.data[i].children.length > 0)
					
					levelDrop(id, $scope.data[i].children);
					//console.log($scope.data);
			}
		}
	}

	levelDrop = function(id, nodes) {
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].id == id && nodes[i].children.length > 0) {
				nodes[i].collapsed = !nodes[i].collapsed;
			} else {
				if (nodes[i].children.length > 0) {
					levelDrop(id, nodes[i].children);
				}
			}
		}
	}
	
	//just for example 
	$scope.showSimpleToast = function(s){
		$mdToast.show(
				$mdToast.simple()
				.textContent(s+" area can not be empty!")
				.position("top right")
				.hideDelay(3000)
		);
	}

}
