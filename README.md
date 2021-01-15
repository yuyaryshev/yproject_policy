# yproject_policy
When you have many projects, it's usually convenient to have same "config" for all of them. This package lets you define policies, than verify and apply them to multiple projects.

Policies usually include:

- Code formatting rules
- Linting rules
- Test tools
- Compilation config
- Folder layouts
- ...etc

###### What is multi-repo? Why not mono repo?

All the above is specifically interesting if you use multi-repo approach, perhaps with **[ymultirepo](https://www.npmjs.com/package/ymultirepo)** package. 

This article describes why that's better:
https://medium.com/@PepsRyuu/monorepos-in-javascript-anti-pattern-917603da59c8

# Installation
1. Projects that consume local modules should have `yproject_policy` installed to node_modules. So
- `pnpm i -g yproject_policy` **AND** set `NODE_PATH` to global modules folder (recommended). 
    You can use the following snippet to set NODE_PATH permanently on Windows:


```bat
pnpm config get prefix > node_path.txt
setx /m /p NODE_PATH= < node_path.txt
setx NODE_PATH %NODE_PATH% /m
erase node_path.txt
```

* **OR**

- Just use `pnpm i yproject_policy --saveDev` in each consumer

2. Use `pnpm config` to set `local_packages_folder` to the folder where you store your projects:

        pnpm config set local_packages_folder YOUR_PATH_TO_PROJECTS_FOLDER

3. Use `pnpm config` to set `text_editor` to specify the path to your text editor, to display the difference in file contents:

        pnpm config set text_editor YOUR_PATH_TO_TEXT_EDITOR

# Usage

## Defining a policy

1. Make a separate git repository for new policy.

2. Place all the files you want to enforce into it.

3. Add  `yproject_policy_definition.cjs`  to the root of your project. This file should contain:

   ```javascript
   module.exports.policy = "POLICY_NAME";
   module.exports.options = {
    exclude: [] // exclude specified folders and files for projects
    // policy options here
   }
   ```

4. If some files should be generated - make a  `FILENAME.gen.cjs`  . This file should contain:

   ```javascript
   module.exports.generate = function generate(packageJson, policyOptions) {
   	return `GENERATED FILE CONTENTS`;
   }
   ```

4. Optionally you can create  `rules.cjs`  to define additional rules in it

## Appling policy to a project

1. Add  `yproject_policy.cjs`  to the root of your project. This file should contain:

   ```javascript
   module.exports.policy = "POLICY_NAME";
   module.exports.options = {
    exclude: [] // ignore specified directories and files during policy enforcement
    // policy options here
   }
   ```

2. Now  `yproject_policy ` - will check this project with specified the policy. It will interactivelly ask what should it do with each policy violation
3. Now  `yproject_policy -a`  - will check all your projects in "local_packages_folder" (see Installation step).

# Uninstallation

If you didn't liked **yproject_policy** uninstallation process is quite simple.

- `pnpm uninstall -g yproject_policy ` (or  `pnpm uninstall yproject_policy ` if you installed it locally)
- delete  `yproject_policy.cjs`  file in your projects 

# Functions (Developer guide)

* 



# TODOs and notes

* Реализовывать в папке **src**, она компилируется в папку **lib** при помощи запуска в отдельной консоли **npm run watch:src**
* В качестве пакетов использовать
  * Dependencies от пакета **npm-check**
  * Наиболее вероятно потребуются:
    * readDirRecursive - см в папке
    * https://www.npmjs.com/package/inquirer
    * https://www.npmjs.com/package/globby
    * https://www.npmjs.com/package/chalk
* FileMap - relativePath, content
* readPolicy(projectDir) -> PolicyData
  * Считать  `yproject_policy_definition.cjs`  в переменную
  * Просканировать существующие файлы, собрать их в массив
    * Исключить из сканирования особые файлы yproject_policy
      * yproject_policy_definition.cjs
    * .gen.js сложить в отдельный массив
    * Учесть ограничения в yproject_policy_definition.cjs
  * Создать map(relativePath, content)
* readProject(projectDir) -> ProjectData
  * Просканировать существующие файлы, собрать в массив
    * Исключить файлы YPOLICY_EXPECTS_*
    * Исключить из сканирования особые файлы yproject_policy
      * yproject_policy.cjs
    * Учесть ограничения в yproject_policy_definition.cjs
    *  `yproject_policy.cjs`  
  * Создать map(relativePath, content)
* genPolicyFiles(policyData, projectData): FileMap 
  * По политике сгенерировать содержимое .gen.js файлов.  map(relativePath, content)
* checkPolicy(policyData, projectData)
  * Собрать полный FileMap файлов по политике
  * Пройти по FileMap политики и проверить что в проекте такие файлы есть и их содержимое равно политике
    * **ЕСЛИ НЕ РАВНО?**
      * Записать рядом файл с префиксом YPOLICY_EXPECTS_*
      * Предложить действия на выбор
        * Пропустить - вывести сообщение и ничего не делать
        * Заменить - перезаписать файл
        * Сравнить - открыть Meld (или другой текстовый редактор, указанный в npm config text_editor)
  * Проверить, что в FileMap проекта нет лишних файлов
    * **ЕСЛИ ЕСТЬ ЛИШНИЕ ФАЙЛЫ?**
    * Предложить действия на выбор
      * Пропустить
      * Удалить




