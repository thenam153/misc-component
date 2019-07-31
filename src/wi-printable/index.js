require('./print-settings');
let html2canvas = require('../../vendor/html2canvas.js');
let jsPDF = require('../../vendor/jspdf.debug.js');
window.Printable = {
    component: component,
    klass: PrintableCtrl
}
module.exports = {
    component: component,
    klass: PrintableCtrl
}
function component(componentData) {
    return {
        controller: componentData.controller,
        controllerAs: componentData.controllerAs || 'self',
        templateUrl: componentData.templateUrl,
        template: componentData.template,
        bindings: {
            orientation: "<",
            aspectRatio: "<",
            alignment: "<",
            printWidth: "<",
            useBorder: "<",
            verticalMargin: "<",
            horizontalMargin: "<",
            printElement: "@",
            printMode: "<",
            paperSize: "<",
            ...componentData.bindings
        },
        transclude: componentData.transclude || false
    }
}
function PrintableCtrl($scope, $element, $timeout, $compile, wiApi, wiLoading) {
    let self = this;
    this.cssClassName = `print-${Date.now()}`;
    let pcpElemHeight = "25px";
    const cssText = `
        .${self.cssClassName} {
            border: 1px solid black !important;
            position: fixed !important;
            z-index: 999;
            top: ${pcpElemHeight};
            left: 0;
            visibility: visible;
            background-color: #ffffff;
        }
        .${self.cssClassName} * {
            visibility: visible;
        }
        * {
            visibility: hidden;
        }
        .${self.cssClassName} ~ .print-cmd-panel {
            position: fixed;
            top: 0;
            left: 0;
        }
        .${self.cssClassName} ~ .print-cmd-panel * {
            visibility: initial;
        }
    `;

    this.getCssText = getCssTextDefault;
    this.getCssTextDefault = getCssTextDefault;
    function getCssTextDefault() {
        return cssText;
    }
    let printStyleText;
    this.doInit = function() {
        self.orientation = self.orientation || "landscape";
        self.aspectRatio = self.aspectRatio || "4:3";
        self.alignment = self.alignment || "left";
        self.printWidth = self.printWidth || 200; // in millimeters
        self.verticalMargin = self.verticalMargin || 0; // in millimeters
        self.horizontalMargin = self.horizontalMargin || 0; // in millimeters
        self.printElement = self.printElement || ".printable";
        self.printMode = self.printMode || "image";
        self.paperSize = 'A4';
        self.paperSizeList = [
            // in millimeters
            {data:{label:'A5'}, properties:{name:'A5', width:148, height: 210}},
            {data:{label:'A4'}, properties:{name:'A4', width:210, height: 297}},
            {data:{label:'A3'}, properties:{name:'A3', width:297, height: 420}}
        ];
        self.aspectRatioList = ['4:3', '16:9'];
        self.defaultBindings();
    }
    this.defaultBindings = function() {
        console.error("Default bindings: Abstract function");
    }
    this.print = print;
    function print() {
        self.preview4Print();
    }
    this.preview4Print = preview4PrintDefault;
    function preview4PrintDefault() {
        const printElem = $element.find(self.printElement);
        self.printElem = printElem;
        self.originalWidth = printElem[0].offsetWidth;
        self.originalHeight = printElem[0].offsetHeight;
        if (self.printMode === 'image') {
            self.originalMarginTop = printElem[0].style.marginTop;
            self.originalMarginBottom = printElem[0].style.marginBottom;
            self.originalMarginLeft = printElem[0].style.marginLeft;
            self.originalMarginRight = printElem[0].style.marginRight;
            self.printElem[0].style.marginTop = `${self.verticalMargin}mm`;
            self.printElem[0].style.marginBottom = `${self.verticalMargin}mm`;
            self.printElem[0].style.marginLeft = `${self.horizontalMargin}mm`;
            self.printElem[0].style.marginRight = `${self.horizontalMargin}mm`;
        }
        let styleElem = document.createElement("style");
        self.styleElem = styleElem;
        styleElem.type = "text/css";
        styleElem.appendChild(document.createTextNode(self.getCssText()));
        document.head.appendChild(styleElem);
        printElem.addClass(self.cssClassName);
        //printElem.width(wiApi.mmToPixel(self.printWidth));
        printElem.width(self.calcPrintWidth(self.printWidth, printElem));
        printElem.height(self.calcPrintHeight(self.printWidth, self.aspectRatio, printElem));
        const pcpElem = document.createElement('div');
        self.pcpElem = pcpElem;
        $(pcpElem).addClass('print-cmd-panel');
        previewScope = $scope.$new();
        previewScope.$ctrl = {
            exitPreview:  self.exitPreview,
            doPrint: doPrint,
            previousPage: self.previousPage,
            nextPage: self.nextPage,
            getPrintInfo: self.getPrintInfo,
            pageIdx: 1,
            goToPage: self.goToPage,
            firstPage: self.firstPage,
            lastPage: self.lastPage
        }
        const pcpContent = `
            <div style="height: ${pcpElemHeight};">
                <span>{{$ctrl.getPrintInfo()}}</span>
                <button ng-click="$ctrl.exitPreview()">Close</button>
                <button ng-click="$ctrl.doPrint()">Print</button>
                <button ng-click="$ctrl.firstPage($ctrl)">First Page</button>
                <button ng-click="$ctrl.previousPage($ctrl)">Previous</button>
                <input ng-model="$ctrl.pageIdx" ng-change="$ctrl.goToPage($ctrl.pageIdx - 1)" ng-model-options="{updateOn: 'change'}">
                <button ng-click="$ctrl.nextPage($ctrl)">Next</button>
                <button ng-click="$ctrl.lastPage($ctrl)">Last Page</button>
            </div>
        `;
        $(pcpElem).append($compile(pcpContent)(previewScope));
        //$(printElem).prepend(pcpElem);
        printElem.parent()[0].append(pcpElem);
    }
    this.previousPage = function() {
        console.log('previous page');
    }
    this.nextPage = function() {
        console.log('next page');
    }
    this.getPrintInfo = function() {
        return;
    } 
    this.goToPage = function(pageIdx) {
        return;
    }
    this.lastPage = function() {
        return;
    }
    this.firstPage = function() {
        return;
    }
    this.calcPrintHeightMM = calcPrintHeightMMDefault;
    function calcPrintHeightMMDefault(w, ratio, htmlElem) {
        switch (ratio) {
            case "4:3":
                return w * 3 / 4;
            case "16:9":
                return w * 9 / 16;
        }
    }
    this.calcPrintHeight = calcPrintHeightDefault;
    function calcPrintHeightDefault(w, ratio, htmlElem) {
        return wiApi.mmToPixel(calcPrintHeightMMDefault(w, ratio, htmlElem));
    }

    this.calcPrintWidth = calcPrintWidthDefault;
    function calcPrintWidthDefault(w, htmlElem) {
        return wiApi.mmToPixel(w);
    }
    this.exitPreview = exitPreview;
    function exitPreview() {
        self.styleElem.remove();
        self.pcpElem.remove();
        //self.printElem.width(self.originalWidth);
        //self.printElem.height(self.originalHeight);
        //if (self.printMode === 'image') {
            //self.printElem[0].style.marginTop = self.originalMarginTop;
            //self.printElem[0].style.marginBottom = self.originalMarginBottom;
            //self.printElem[0].style.marginLeft = self.originalMarginLeft;
            //self.printElem[0].style.marginRight = self.originalMarginRight;
        //}
    }
    function html2Canvas(htmlElem, config, callback) {
        html2canvas(htmlElem, {
            allowTaint: true,
            foreignObjectRendering:true,
            x: (htmlElem.offsetLeft - wiApi.mmToPixel(self.horizontalMargin)) / 2,
            y: (htmlElem.offsetTop - wiApi.mmToPixel(self.verticalMargin)) / 2,
            scale: 1,
            width: _.max([
                htmlElem.scrollWidth,
                htmlElem.offsetWidth,
                htmlElem.clientWidth
            ]) + wiApi.mmToPixel(self.horizontalMargin) * 2,
            height: _.max([
                htmlElem.scrollHeight,
                htmlElem.offsetHeight,
                htmlElem.clientHeight
            ]) + wiApi.mmToPixel(self.verticalMargin) * 2,
            ...config
        }).then(canvas => {
            callback && callback(canvas);
        })
    }
    function exportAsImage() {
        self.printElem[0].style.top = 0;
        html2Canvas(self.printElem[0], {}, canvas => {
            let a = document.createElement('a');
            a.addEventListener('click', function(ev) {
                a.href = canvas.toDataURL("image/png");
                a.download = `${(self.getConfigTitle && self.getConfigTitle())
                        || 'myPNG'}.png`;
            }, false);
            document.body.appendChild(a);
            a.click();
            a.remove();

            //let image = new Image();
            //image.src = canvas.toDataURL("image/png");
            //let w = window.open("");
            //w.document.write(image.outerHTML);
            //w.document.close();
        })
        self.printElem[0].style.top = pcpElemHeight;
    }
    function exportAsPDF() {
        self.printElem[0].style.top = 0;
        html2Canvas(self.printElem[0], {
            x: 0,
            y: 0
        }, canvas => {
            let imgData = canvas.toDataURL("image/png");
            let pdf = new jsPDF(self.orientation, 'mm', self.paperSize.toLowerCase());
            //let onePageHeight = pdf.internal.pageSize.height;
            //let printElemHeight = self.printElem.height();
            //let pageNums = printElemHeight % onePageHeight ? printElemHeight / onePageHeight + 1 : printElemHeight / onePageHeight;
            //for (let i = 0; i < pageNums; i++) {
                //pdf.addPage();
            //}
            //console.log(onePageHeight);
            pdf.addImage(imgData, 'PNG', self.horizontalMargin, self.verticalMargin);
            pdf.save(`${(self.getConfigTitle && self.getConfigTitle())
                        || 'myPDF'}.pdf`);
        })
        self.printElem[0].style.top = pcpElemHeight;
    }
    this.doPrint = doPrint;
    function doPrint() {
        switch(self.printMode) {
            case "image":
                exportAsImage();
                break;
            case "pdf":
                exportAsPDF();
                break;
        }
    }
    this.setPrintWidth = setPrintWidth;
    function setPrintWidth(notUse, newValue) {
        self.printWidth = parseFloat(newValue);
    }
    this.setVerticalMargin = setVerticalMargin;
    function setVerticalMargin(notUse, newValue) {
        self.verticalMargin = parseFloat(newValue);
    }
    this.setHorizontalMargin = setHorizontalMargin;
    function setHorizontalMargin(notUse, newValue) {
        self.horizontalMargin = parseFloat(newValue);
    }
    this.changeAspectRatio = changeAspectRatio;
    function changeAspectRatio(aspectRatio) {
        self.aspectRatio = aspectRatio;
    }
    this.onZonesetSelectionChanged = onZonesetSelectionChanged;
    function onZonesetSelectionChanged(selectedItemProps) {
        self.paperSize = (selectedItemProps || {}).name;
    }
}
