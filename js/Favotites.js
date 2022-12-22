export class GithubUser {
    static search(username) {
        const endpoint = `https://api.github.com/users/${username}`

        return fetch(endpoint)
        .then(data => data.json())
        .then(({login, name, public_repos, followers}) => ({
            login,
            name,
            public_repos,
            followers,
        }))
    }
}

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favotites:')) || []
    }

    save() {
        localStorage.setItem('@github-favotites:', JSON.stringify(this.entries))
    }

    async add(username) {
        try {
            const userExists = this.entries.find(entry => entry.login === username)
            console.log(userExists)

            if(userExists) {
                throw new Error('Usuário já cadastrado')
            }

            const user = await GithubUser.search(username)
            
            if(user.login === undefined) {
                throw new Error('Usuário não encontrado')
            }

            this.entries = [user, ...this.entries]
            this.update()
            this.save()
            
        }catch(error){
            alert(error.message)
        }

    }

    delete(user) {
        const filteredEntries = this.entries
        .filter(entry => entry.login !== user.login)
        this.entries = filteredEntries
        this.update()
        this.save()
    }
}

export class FavoritesView extends Favorites {
    constructor (root) {
        super(root)

        this.tbody = this.root.querySelector('table tbody')
        this.update()
        this.onAdd()
    }

    update() {
        this.removeAlltr()

        this.entries.forEach(user => {
            const row = this.createRow()

            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Imagem de ${user.name}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = user.login
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.follower').textContent = user.followers

            row.querySelector('.remove').onclick = () => {
                const isOk = confirm(`Tem certeza que deseja deletar?`)

                if(isOk){
                    this.delete(user)
                }
            }
            this.tbody.append(row)
        })
    } 

    onAdd() {
        const addButton = this.root.querySelector('.search button')

        addButton.onclick = () => {
            const { value }  = this.root.querySelector('.search input')
            this.add(value)
        }

    }
    
    createRow() { 
        const tr = document.createElement('tr')
        tr.innerHTML = `
        <td class="user">
                <img src="https://github.com/maykbrito.png" alt="">
                <a href="" target="_blank">
                    <p>Mayk Brito</p>
                    <span>maykbrito</span>
                </a>
            </td>
            <td class="repositories">
                13
            </td>
            <td class="follower">
                677
            </td>
            <td>
                <button class="remove">&times;</button>
                </td>
                `
                return tr
    }

    removeAlltr() {    
        this.tbody.querySelectorAll('tr')
        .forEach((tr) => {
            tr.remove()
        })
    }
}