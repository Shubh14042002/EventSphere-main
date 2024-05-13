//component that will actually put your todos on the DOM, this is gonna be the list of todos on the webpage
export function Users() {  //instead of props just do object destructuring, whatever object the fn is passed its just gonna take todos out of it
    return <div>
        {todos.map(function(todo, index){   //for each todo in the array it maps this function to it and then outputs basically like running a for loop and indexing into each element using i
            return <div key = {index} className="todo-item">
                <h1>{todo.title}</h1>
                <h2>{todo.description}</h2>
                <button>{todo.completed == true ? "Completed" : "Mark as complete"}</button>
            </div>
        })}
    </div>
}