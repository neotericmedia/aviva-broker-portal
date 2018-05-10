pipeline {
    agent {label 'digital'}

    stages {

        stage('build') { 
            steps { 
                tool name: 'nodejs-8.2.0', type: 'nodejs'

                sh '''echo $PATH
                node --version
                npm --version

                #Set proxy 
                npm install node-sass --ignore-scripts --registry https://qa.artifactory.ana.corp.aviva.com/artifactory/api/npm/digital-dev-npm/
                # wget --no-check-certificate https://qa.artifactory.ana.corp.aviva.com/artifactory/aviva-catalyst-npm/node-v8.9.2-headers.tar.gz
                curl -k -ue81312:AP6L387ACgd1tNdJVH8764zXPkp -O "https://qa.artifactory.ana.corp.aviva.com/artifactory/aviva-catalyst-npm/node-v8.9.2-headers.tar.gz"
                cd node_modules/node-sass
                /usr/bin/node ../../node_modules/node-gyp/bin/node-gyp.js rebuild --verbose --libsass_ext= --libsass_cflags= --libsass_ldflags= --libsass_library= --tarball=../../node-v8.9.2-headers.tar.gz
                #Build with proxy and internet access
                cd ../../
		        # Step to fix missing vendor folder in node-sass
                npm rebuild node-sass
                #Build with proxy and internet access
                npm  -loglevel verbose install --registry https://qa.artifactory.ana.corp.aviva.com/artifactory/api/npm/digital-dev-npm/
                #unset http_proxy
                #unset https_proxy
                npm  -loglevel verbose install digital-css --registry https://qa.artifactory.ana.corp.aviva.com/artifactory/api/npm/aviva-catalyst-npm/
                npm -loglevel verbose run build:prod


                directory=`pwd`
                echo "Directory = $directory"

                # create a temporary directory to hold Catalyst artifact zip 
                [ ! -d /tmp/catalystUI ] && mkdir -p /tmp/catalystUI


                echo "Remove tarball if already exists"
                [ -f /tmp/catalystUI/catalystUI-1.0-SNAPSHOT.zip ] && rm -f /tmp/catalystUI/catalystUI-1.0-SNAPSHOT.zip

                echo "Create tarball of dist folder"
                zip -r /tmp/catalystUI/catalystUI-1.0-SNAPSHOT.zip --exclude="*.git*" --exclude="*.yaml"  --exclude=\'*Dockerfile\' --exclude=\'*Jenkinsfile\' --exclude="*.gitignore"  dist

                echo "Upload dist zip to maven repo"
                curl -u catalystdeploy:catalyst123 --upload-file /tmp/catalystUI/catalystUI-1.0-SNAPSHOT.zip  https://nexus.ana.corp.aviva.com/repository/aviva-catalyst-snapshot/aviva-catalyst/catalystUI/1.0-SNAPSHOT/'''

            }
        }
    }
}
