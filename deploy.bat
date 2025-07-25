@echo off
SETLOCAL

REM Ensure we are in the correct directory
pushd "%~dp0" || (
    echo Error: Could not change to script directory
    EXIT /B 1
)

REM 1. Set version number
REM Read current version from package.json
echo Reading version from package.json...
FOR /F "tokens=*" %%i IN ('node -p "require('./package.json').version" 2^>NUL') DO SET "CURRENT_VERSION=%%i"
IF "%CURRENT_VERSION%"=="" (
    call :error_exit "Could not read current version from package.json"
)
echo Current version is %CURRENT_VERSION%

REM Get new version from user
:get_version
SET /P NEW_VERSION="Enter new version (current: %CURRENT_VERSION%): "
IF "%NEW_VERSION%"=="" (
    echo Version cannot be empty
    goto get_version
)

REM Update version in package.json
node -e "const fs = require('fs'); const pkg = require('./package.json'); pkg.version = '%NEW_VERSION%'; try { fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n'); } catch (e) { process.exit(1); }"
IF ERRORLEVEL 1 (
    call :error_exit "Could not update package.json version"
)
echo Version updated to %NEW_VERSION% in package.json

REM 2. Commit to Git
REM Add package.json to staging area
git add package.json
IF ERRORLEVEL 1 (
    call :error_exit "Could not add package.json to git"
)

REM Commit changes
git commit -m "Release v%NEW_VERSION%"
IF ERRORLEVEL 1 (
    call :error_exit "Could not commit changes to git"
)

REM Tag the release
git tag "v%NEW_VERSION%"
IF ERRORLEVEL 1 (
    call :error_exit "Could not create git tag"
)

echo Git changes committed with tag v%NEW_VERSION%

REM 3. Optional npm publish
choice /c YN /m "Publish to npm (Y/N)? "
IF ERRORLEVEL 2 (
    echo Skipping npm publish
) ELSE (
    npm publish
    IF ERRORLEVEL 1 (
        call :error_exit "npm publish failed"
    )
    echo Package published to npm
)

REM 4. Compile zip package
echo Building project...
yarn build
IF ERRORLEVEL 1 (
    call :error_exit "yarn build failed"
)

echo Reading project name from package.json...
FOR /F "tokens=*" %%i IN ('node -p "require('./package.json').name" 2^>NUL') DO SET "PROJECT_NAME=%%i"
IF "%PROJECT_NAME%"=="" (
    call :error_exit "Could not read project name from package.json"
)
echo Project name is %PROJECT_NAME%

SET "ZIP_FILE=%PROJECT_NAME%-v%NEW_VERSION%.zip"
SET "TEMP_DIR=dist_zip"

REM Create and cleanup temporary directory
rd /Q /S "%TEMP_DIR%" 2>NUL
mkdir "%TEMP_DIR%"
IF NOT EXIST "%TEMP_DIR%" (
    call :error_exit "Could not create temporary directory"
)

REM Copy files to temporary directory
xcopy /E /Q /I /Y dist "%TEMP_DIR%\dist\" >NUL
IF ERRORLEVEL 1 (
    call :error_exit "Could not copy dist directory"
)

copy package.json "%TEMP_DIR%\" >NUL
IF ERRORLEVEL 1 (
    call :error_exit "Could not copy package.json"
)

copy README*.md "%TEMP_DIR%\" >NUL
IF ERRORLEVEL 1 (
    call :error_exit "Could not copy README files"
)

copy LICENSE "%TEMP_DIR%\" >NUL
IF ERRORLEVEL 1 (
    call :error_exit "Could not copy LICENSE"
)

REM Create zip file
echo Creating zip package...
powershell -Command "$ErrorActionPreference = 'Stop'; Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('%TEMP_DIR%', '%ZIP_FILE%');"
IF ERRORLEVEL 1 (
    call :error_exit "Could not create zip file"
)

REM Cleanup temporary directory
rd /Q /S "%TEMP_DIR%"
IF ERRORLEVEL 1 (
    call :error_exit "Could not remove temporary directory"
)

echo Zip package created: %ZIP_FILE%
echo Deployment script finished successfully!

popd
ENDLOCAL
EXIT /B 0

REM Function to display error and exit - moved to the end as requested
:error_exit
    echo Error: %1
    popd
    ENDLOCAL
    EXIT /B 1
