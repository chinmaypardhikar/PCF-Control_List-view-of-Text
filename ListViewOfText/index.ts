import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class ListViewOfText implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private container : HTMLDivElement;
    private inputContainer : HTMLDivElement;
    private form : HTMLFormElement;
    private input : HTMLInputElement;
    private button : HTMLButtonElement;
    private displayList : HTMLDivElement;
    private list : HTMLDivElement;
    private listItem: HTMLParagraphElement;
    private image: HTMLImageElement;
    private context: ComponentFramework.Context<IInputs>;
    private notifyOutputChanged: () => void;
    private D365FieldValue: string;

    constructor()
    {

    }

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
    {
        this.context = context;
        this.notifyOutputChanged = notifyOutputChanged;

        // Add control initialization code
        this.container = container;
        this.container.setAttribute("class" ,"Container");

        //inputContainer
        this.inputContainer = document.createElement("div");
        this.inputContainer.setAttribute("class", "Input-Container");

        //Form
        this.form = document.createElement("form");
        this.form.setAttribute("id" , "form");

        //Input 
        this.input = document.createElement("input");
        this.input.setAttribute("type","text");
        this.input.setAttribute("value","");
        this.input.setAttribute("class","input-field");
        this.input.setAttribute("id","InputValue");
        this.input.setAttribute("placeholder",context.parameters.placeholderName.raw||"");

        //Button
        this.button = document.createElement("button");
        this.button.setAttribute("type","button");
        this.button.setAttribute("id","addButton");
        this.button.textContent=context.parameters.ButtonName.raw||"Add";
        this.button.style.background = context.parameters.ButtonColor.raw||"#6471c1";

        //Display List
        this.displayList = document.createElement("div");
        this.displayList.setAttribute("class","Display-list");
        this.displayList.setAttribute("id","Display-list");
        this.displayList.style.maxHeight = context.parameters.VerticalScrollBar.raw||"none";

        //Append tags
        this.form.appendChild(this.input);
        this.form.appendChild(this.button);
        this.inputContainer.appendChild(this.form);
        this.container.appendChild(this.inputContainer);
        this.container.appendChild(this.displayList);

        //Eventlistner
        this.button.addEventListener("click", this.addDataToList.bind(this));

        this.input.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
              event.preventDefault();
            document.getElementById("addButton")!.click();
            }
          });

        this.D365FieldValue = context.parameters.D365Field.raw || "";
        if(!(this.D365FieldValue == "" || this.D365FieldValue == null || this.D365FieldValue.trim() == null)){
            this.onLoadList();
        }
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void
    {
    }

    public getOutputs(): IOutputs
    {
       
        const display_List = document.getElementById("Display-list");
        const listCollection = display_List?.getElementsByClassName('list-value');
        let outputValueForD365:string= "";
        
        if(listCollection != undefined){
            if(listCollection.length>0){
            outputValueForD365 = listCollection[0].getAttribute("name")?.trim()||"";}
        for (var i = 1; i < listCollection.length; i++) {
            outputValueForD365 = outputValueForD365+(this.context.parameters.TextSeparator.raw||"ǂ")+ listCollection[i].getAttribute("name")?.trim();
        }
        }
         
            return {
                D365Field:outputValueForD365
                
            };
    }

    public destroy(): void
    {
    }

    public addDataToList(): void {
        const inputValue: string = (document.getElementById("InputValue") as HTMLInputElement).value;
        
        if (inputValue == null || inputValue.trim() == "") {
            (document.getElementById("InputValue") as HTMLInputElement).value = '';
            return;
        }

        if(!(this.context.parameters.D365Field.raw == null ||this.context.parameters.D365Field.raw.trim()=="")){
            const D365FieldArray = this.context.parameters.D365Field.raw.toLowerCase().split(this.context.parameters.TextSeparator.raw||"ǂ");
            if(D365FieldArray.includes(inputValue.toLowerCase())){
                (document.getElementById("InputValue") as HTMLInputElement).value = '';
                return;
            }
        }

        this.addItem(inputValue);
        this.notifyOutputChanged();
        (document.getElementById("InputValue") as HTMLInputElement).value = '';
    }

    public onLoadList(): void {
        const inputValueArray = this.D365FieldValue.split(this.context.parameters.TextSeparator.raw||"ǂ");

        inputValueArray.forEach(inputValue => {  
            this.addItem(inputValue);
        });  
        (document.getElementById("InputValue") as HTMLInputElement).value = '';
        
    }

    public addItem(inputValue:string): void{
        this.list= document.createElement("div");
        this.list.setAttribute("class","list");
        this.listItem= document.createElement("p");
        this.listItem.setAttribute("name",inputValue);
        this.listItem.setAttribute("class","list-value");
        this.listItem.innerHTML = inputValue;
        this.list.appendChild(this.listItem);
        this.image = document.createElement("img");
        this.image.setAttribute("class","cross");
        this.image.setAttribute("src",this.context.parameters.DeleteImage.raw||"https://content.powerapps.com/resource/uci-infra/resources/images/Delete.2713f7a803a36d57dcc050874401427f.svg");
        this.image.setAttribute("alt","delete");
        this.image.setAttribute("width","20");
        this.image.setAttribute("height","20");
        this.image.addEventListener("click", this.removeData.bind(this.image,this.notifyOutputChanged));
        this.list.appendChild(this.image);
        this.displayList.appendChild(this.list);
    }

    public removeData(this:HTMLElement,notifyOutputChanged: () => void): void{
        this.parentElement?.remove();
        notifyOutputChanged();
    }
}
