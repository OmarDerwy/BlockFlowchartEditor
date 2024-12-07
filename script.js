class Node{
    static depth = []; //considering strongly removing the depth array since it serves no functional purpose
    static noOfNodes = 0;
    static objects= [];
    constructor(buttonElement, textBoxValue){
        this.text = textBoxValue;

        // create block element and set text inside it
        this.node = document.createElement('div');
        this.node.className = 'box';

        //create p element inside the node
        const p = document.createElement('p');
        p.className = 'nodeDisplayedText';
        p.innerText = this.text;
        this.node.appendChild(p);

        // specify the block which initiated the node (important to determine which block belongs to which branch)
        this.parentNodeElement = buttonElement.parentNode;

        // add block recieved to the object
        this.buildingContainer = buttonElement.parentNode.parentNode;

        //create an add node button and append it to that node
        const addNodeBtn = document.createElement('button');
        addNodeBtn.className = 'Btn addBtn';
        addNodeBtn.addEventListener('click', () => {event.stopPropagation();createNewNode(addNodeBtn);});
        addNodeBtn.textContent = '+';
        this.node.appendChild(addNodeBtn);

        //create a remove node button and append it to that node
        const removeNodeBtn = document.createElement('button');
        removeNodeBtn.className = 'Btn removeBtn';
        removeNodeBtn.addEventListener('click', () => {event.stopPropagation();Node.remove(removeNodeBtn);});
        removeNodeBtn.textContent = '-';
        this.node.appendChild(removeNodeBtn);

        //add noOfNodes as an id to nodes for now. Use a different system later if we need
        this.node.id = `node${Node.noOfNodes}`;
        
        //add attribute that links to parent node element
        this.node.setAttribute('data-parent', this.parentNodeElement.id);

        //add attribute that links parent to this node
        let children = this.parentNodeElement.getAttribute('data-children');
        if(children === null)
        {
            this.parentNodeElement.setAttribute('data-children', this.node.id);
        }
        else
        {
            this.parentNodeElement.setAttribute('data-children', `${children} ${this.node.id}`);
        }
        //add node either as a branch or a leaf
        if(this.buildingContainer.nextElementSibling !== null) //branch
        {
            this.buildingContainer.nextElementSibling.appendChild(this.node);
            //update the depth value 
            let currentLayer = this.buildingContainer.nextElementSibling.id.split('layer')[1];
            Node.depth[currentLayer].push(this.node);
            //check if any node belongs to the same data-parent node before adding event listeners to both nodes
            Node.addClickableBox(this.node);
                 

        }
        else //leaf
        {
            //create and position new row
            const newRow = document.createElement('div');
            newRow.className = 'rowContainer';
            newRow.id = `layer${Node.depth.length}`;
            this.buildingContainer.parentNode.appendChild(newRow);

            //configure and position node
            this.arrayofNodes = [];
            this.arrayofNodes.push(this.node);
            Node.depth.push(this.arrayofNodes);
            newRow.appendChild(this.node);
            if(this.parentNodeElement.classList.contains('activeBranch'))
            {
                this.node.classList.add('activeBranch');
            }
        }
        document.querySelector(`#nodeText`).value = (Node.noOfNodes+1).toString().padStart(3, '0');
        updateSourceCode();
        updateDropdownAndHandleSelection();
    }

    static addClickableBox(element){
        element.parentNode.childNodes.forEach((child) => { //fix this to only target the parent's children
            if(child !== element)
            {
                if(child.getAttribute('data-parent') === element.getAttribute('data-parent'))
                {
                    if(!child.classList.contains('clickableBox'))
                    {
                        child.addEventListener('click', () => {toggleElement(child);});
                        child.classList.add('clickableBox');
                    }
                    if(!element.classList.contains('clickableBox'))
                    {
                        element.addEventListener('click', () => {toggleElement(element);});
                        element.classList.add('clickableBox');
                    }

                }
            }
        })
    }

    static remove(element){
        let dataParent = element.parentNode.getAttribute('data-parent');
        let elementDataParent = document.querySelector(`#${dataParent}`);
        let elementNodeParent = element.parentNode.parentNode;
        //elementDataParent = document.querySelector(`#${elementDataParent}`);
        //get children of element
        if(element.parentNode.getAttribute('data-children')){
            let children = element.parentNode.getAttribute('data-children').split(' ');
            children.forEach((child) => {
                //link the data-child to the data-parent of the element
                let elementDataChild = document.querySelector(`#${child}`);
                elementDataChild.setAttribute('data-parent', dataParent);
                elementNodeParent.appendChild(elementDataChild);
                Node.addClickableBox(elementDataChild);
            })
        } else {
            var children = new Array;
        }
        //link elementDataParent with the children
        if(elementDataParent.getAttribute('data-children')){
            let elementDataParentChildren = elementDataParent.getAttribute('data-children').split(' ');
            let indexOfElementBringRemoved = elementDataParentChildren.indexOf(element.parentNode.id);
            elementDataParentChildren.splice(indexOfElementBringRemoved, 1);
            elementDataParentChildren = elementDataParentChildren.concat(children);
            elementDataParent.setAttribute('data-children', elementDataParentChildren.join(' '));
        }
            
        //if rowContainer has only the child that is about to be removed, remove the rowContainer
        if(elementNodeParent.children.length === 1)
        {
            element.parentNode.parentNode.remove();
        }else{
            //remove element
            element.parentNode.remove();
        }
        updateSourceCode();
        updateDropdownAndHandleSelection();
    }
}

//--------------adding event listeners----------------//
addEventListeners();
function addEventListeners(){
    document.querySelectorAll('button.addBtn').forEach((element) => {
        element.addEventListener('click', () => {event.stopPropagation();createNewNode(element);});
    });

    document.querySelectorAll('button.removeBtn').forEach((element) => {
        element.addEventListener('click', () => {event.stopPropagation();Node.remove(element);});
    });

    document.querySelector('#removeButtons').addEventListener('click', removeButtons);
}
const inputElement = document.getElementById("uploadHTML");
inputElement.addEventListener("change", () => {
    const file = inputElement.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        const content = reader.result;
        //parse json file into object
        const obj = JSON.parse(content);
        Node.noOfNodes = obj.noOfNodes;
        Node.depth = obj.depth;
        Node.objects = obj.objects;
        document.getElementById("flowchart").innerHTML = obj.flowchartHTML;
        updateSourceCode();
        document.querySelectorAll('.clickableBox').forEach((element) => {
            element.addEventListener('click', () => {
                toggleElement(element);
            });
        });
        addEventListeners();
    };
    reader.readAsText(file);
}, false);

//----------------End of event listeners--------------//

function toggleElement(element)
{
    //---------------inner functions-----------------//
    const hideElements = (element) => {
        if(element.nextElementSibling !== null)
            {
                hideElements(element.nextElementSibling);
            }
            Array.from(element.children).forEach((child) => {
                if(child.classList.contains('activeBranch'))
                {
                    child.classList.remove('activeBranch');
                }
                //child.style.flexGrow = 0;
                child.style.display = 'none';
            });
            
    }
    const activateElements = (element) => {
        element.style.display = 'flex';

        if(element.getAttribute('data-children') !== null)
        {
            let Children = element.getAttribute('data-children').split(' ');
            if(Children.length > 1)
            {
                Children.forEach((child) => {
                    document.querySelector(`#${child}`).style.display = 'flex';
            
                });
            }
            else
            {
                let child = element.getAttribute('data-children');
                activateElements(document.querySelector(`#${child}`));

            }
        }
    }
    //---------------end of inner functions-----------------//

    if(element.parentNode.nextElementSibling !== null){
        if(element.classList.contains('activeBranch'))
        {
            element.classList.remove('activeBranch');
            hideElements(element.parentNode.nextElementSibling);
            const dataParent = document.querySelector(`#${element.getAttribute('data-parent')}`);
            const siblings = dataParent.getAttribute('data-children').split(' ').forEach((child) => {
                document.querySelector(`#${child}`).style.display = 'flex';
            });
        } else {
            

            hideElements(element.parentNode.nextElementSibling);

            //node's siblings
            Array.from(element.parentNode.children).forEach((child) => {
                if(child.classList.contains('activeBranch'))
                {
                    child.classList.remove('activeBranch');

                }
                child.style.display = 'none';
            });

            element.classList.add('activeBranch');
            //element.style.flexGrow = element.parentNode.children.length;
            activateElements(element);
        }
    }
}
function removeButtons(){
    document.querySelectorAll('.addBtn, .removeBtn').forEach((element) => {
        element.remove();
    });
    document.querySelector('.highlight').classList.remove('highlight');
    updateSourceCode();
}

function createNewNode(element){
    const textBoxValue = document.querySelector('#nodeText').value;
    Node.objects[Node.noOfNodes] = new Node(element, textBoxValue);
    Node.noOfNodes++;
}

function updateSourceCode() {
    const flowchartHTML = document.getElementById('flowchart').innerHTML;
    document.getElementById('sourceCode').innerText = `<div class="flowchart" id="flowchart">\n` + flowchartHTML + `\n</div>`;

    //create an object that includes the current Node class static varriables as well as flowchartHTML
    const flowchartObject = {
        'flowchartHTML': flowchartHTML,
        'depth': Node.depth,
        'noOfNodes': Node.noOfNodes,
        'objects': Node.objects,
    };
    //convert object into json
    const flowchartJSON = JSON.stringify(flowchartObject);

    //create a new blob from the JSON to be downloaded as a json file through the download button
    const blob = new Blob([flowchartJSON], { type: 'application/json' });
    document.getElementById('downloadButton').href = URL.createObjectURL(blob);

    document.getElementById('downloadButton').download = `flowchart_${Date.now()}.json`;
}

const clipboard = new ClipboardJS('#copyButton');

clipboard.on('success', (e) => {
  console.log('Text copied to clipboard');
});

clipboard.on('error', (e) => {
  console.error('Error copying text to clipboard:', e);
});

function updateDropdownAndHandleSelection() {
    const flowchart = document.getElementById('flowchart');
    const dropdown = document.getElementById('nodeDropdown');

    // Select all descendants of the container that have an id of the form 'node#'
    const nodes = flowchart.querySelectorAll('div[id^="node"]');

    // Clear existing options in the dropdown
    dropdown.innerHTML = `<option value="">Select a node</option>
                          <option value="flowchartRoot">flowchartRoot</option>`;

    // Populate the dropdown with options based on the found nodes
    nodes.forEach((node) => {
        const option = document.createElement('option');
        option.value = node.id;
        option.textContent = node.id;
        dropdown.appendChild(option);
    });

    // Add event listener for when a dropdown item is selected

}
document.getElementById('nodeDropdown').addEventListener('change', function() {
    const flowchart = document.getElementById('flowchart');
    // Select all descendants of the container that have an id of the form 'node#'
    const nodes = flowchart.querySelectorAll('#outerContainer>*>div');
    // Remove orange border from all elements
    nodes.forEach(node => node.classList.remove('highlight'));

    // Get the selected value
    const selectedNodeId = this.value;

    // If a valid node is selected, highlight it by adding a orange border
    if (selectedNodeId) {
        const selectedNode = document.getElementById(selectedNodeId);
        selectedNode.classList.add('highlight');
    }
});

function updateColor() {
    const color = document.querySelector("#nodeBgColor").value;
    const nodeDropdown = document.getElementById('nodeDropdown').value;
    const node = document.getElementById(nodeDropdown);
    const choice = document.getElementById('nodeColor').value;
    if (node) {
        if (choice === 'backgroundColor') {
            node.style.backgroundColor = color;
        } else if (choice === 'fontColor') {
            node.style.color = color;
        } else if (choice === 'borderColor') {
            node.style.borderColor = color;
            node.style.borderStyle = 'solid';
            node.style.borderWidth = '2px';
        }else{
            alert("Please select what you want to change.");
        }
        updateSourceCode();
    } else {
        alert("Node not found.");
    }
}

function updateNodeText() {
    const newText = document.getElementById('nodeText').value;
    const nodeDropdown = document.getElementById('nodeDropdown').value;
    const node = document.querySelector(`#${nodeDropdown}>p`);
    
    if (node) {
        node.innerText = newText;
        updateSourceCode();
    } else {
        alert("Node not found.");
    }
}

function updateFont(font) {
    const nodeDropdown = document.getElementById('nodeDropdown').value;
    const node = document.querySelector(`#${nodeDropdown}>p`);
    
    if (node && font) {
        node.style.fontFamily = font;
        updateSourceCode();
    } else if (!font) {
        alert("Please select a font.");
    } else {
        alert("Node not found.");
    }
}