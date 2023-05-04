build:
	docker build -t oaitbot .

run:
	docker run -d -p 3000:3000 --name oaitbot --rm oaitbot