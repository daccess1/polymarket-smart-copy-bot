PLUGINS_PATH = ./src/plugins/
PLUGINS_TESTS_PATH = ./test/

.PHONY: get post delete test run push

# Run in local docker
run:
	@docker compose build && \
	docker compose up --no-start && \
	docker compose start

#Pushes to CR
push:
	@VERSION=$$(node -p "require('./package.json').version"); \
	VERSION=$$VERSION docker compose -f docker-compose-serverless.yml build && VERSION=$$VERSION docker compose -f docker-compose-serverless.yml push

# GET plugin target (uses create-plugin with method=get)
get:
	@if [ -z "$(name)" ]; then \
		name=$(word 2, $(MAKECMDGOALS)); \
	fi; \
	if [ -z "$$name" ]; then \
		echo "Error: plugin name is not set"; \
		exit 1; \
	fi; \
	$(MAKE) create-dir name=$$name; \
	$(MAKE) create-plugin method=get name=$$name;

# POST plugin target (uses create-plugin with method=post)
post:
	@if [ -z "$(name)" ]; then \
		name=$(word 2, $(MAKECMDGOALS)); \
	fi; \
	if [ -z "$$name" ]; then \
		echo "Error: plugin name is not set"; \
		exit 1; \
	fi; \
	$(MAKE) create-dir name=$$name; \
	$(MAKE) create-plugin method=post name=$$name

# DELETE plugin target (uses create-plugin with method=delete)
delete:
	@if [ -z "$(name)" ]; then \
		name=$(word 2, $(MAKECMDGOALS)); \
	fi; \
	if [ -z "$$name" ]; then \
		echo "Error: plugin name is not set"; \
		exit 1; \
	fi; \
	$(MAKE) create-dir name=$$name; \
	$(MAKE) create-plugin method=delete name=$$name

create-dir:
	@dir=$(PLUGINS_PATH)$(dir $(name)) && \
	test_dir=$(PLUGINS_TESTS_PATH)$(dir $(name)) && \
	echo "Dirs: $${dir%/} $${test_dir%/}" && \
	mkdir -p $${dir%/} && \
	mkdir -p $${test_dir%/} && \
	echo "Directory structure updated: $${dir}" && \
	echo "Test directory structure updated: $${test_dir}"

# Generalized target to create a plugin (used for both GET and POST)
create-plugin:
	@endpoint=$(notdir $(name)) && \
	dir=$(dir $(name)) && \
	plugin_path=$$(echo $${dir%/}) && \
	clean_dir=$$(echo $${dir%/} | sed 's/\// /g') && \
	plugin_parent=$$(echo $${dir%/} | sed 's/\// /g' | awk '{print $$1}') && \
	file=$(PLUGINS_PATH)$${dir}$${method}.$(notdir $(name)).ts && \
	cp ./template/$(method).plugin.template.ts $${file} && \
	sed -i "s/REQUEST_ENDPOINT/$${endpoint}/g" $${file} && \
	sed -i "s/REQUEST_URL/$$(echo $(name) | sed 's/\//\\\//g')/g" $${file} && \
	sed -i "s/SAMPLE_TYPE/$${clean_dir}/g" $${file} && \
	sed -i "s/PLUGIN_PARENT/$${plugin_parent}/g" $${file} && \
	echo "Created Fastify plugin: $${file} at $${dir}" && \
	test_file=$(PLUGINS_TESTS_PATH)$${dir}$${method}.$(notdir $(name)).test.ts && \
	cp ./template/$(method).test.template.ts $${test_file} && \
	sed -i "s/REQUEST_ENDPOINT/$${endpoint}/g" $${test_file} && \
	sed -i "s|PLUGIN_PATH|$${plugin_path}|g" $${test_file} && \
	sed -i "s/REQUEST_URL/$$(echo $(name) | sed 's/\//\\\//g')/g" $${test_file} && \
	sed -i "s/SAMPLE_TYPE/$$(echo $${dir%/} | sed 's/\//_/g')/g" $${test_file} && \
	depth=$$(echo $${dir} | sed 's/\/$$//' | awk -F"/" '{print NF}') && \
	relpath=""; \
	for i in $$(seq 1 $$depth); do relpath="../$$relpath"; done; \
	sed -i "s|src|$${relpath}src|g" $${test_file} && \
	echo "Created Fastify plugin tests: $${test_file}"

#Generate test not associated with fastify plugin
test:
	@if [ -z "$(word 2,$(MAKECMDGOALS))" ]; then \
		echo "Error: test param is not set"; \
		exit 1; \
	fi; \
	param="$(word 2,$(MAKECMDGOALS))"; \
  	$(MAKE) create-test param=$$param

create-test:
	@dir=$(dir $(param)) && \
	clean_dir=$$(echo $${dir%/} | sed 's/\// /g') && \
	test_name=$$(echo $${param%/} | sed 's/\// /g') && \
	full_dir=$(PLUGINS_TESTS_PATH)$${dir} && \
	file_name=$(notdir $(param)).test.ts && \
	file_path=$$full_dir$$file_name && \
	mkdir -p $${full_dir%/} && \
	cp ./template/template.test.ts $$file_path && \
	sed -i "s/TEST_NAME/$${test_name}/g" $${file_path} && \
	echo "Test created";

# Catch-all rule to prevent errors for non-existing targets
%:
	@: